from collections import defaultdict
from typing import Generator

import numpy as np
from scipy.spatial import Voronoi
from shapely.geometry import Polygon

from .uniform import uniform_sample


def voronoi_sample(polygon: np.ndarray, n_points: int) -> np.ndarray:
    """Select n points with Lloyds algorithm inside a polygon"""
    xmin = polygon[:, 0].min()
    ymin = polygon[:, 1].min()
    polygon[:, 0] -= xmin
    polygon[:, 1] -= ymin
    starters = np.random.permutation(uniform_sample(polygon))[:n_points]
    points = lloyds_algorithm(starters, polygon)[0]
    points[:, 0] += xmin
    points[:, 1] += ymin
    return points


def lloyds_algorithm(starters: np.ndarray, boundary: np.ndarray) -> np.ndarray:
    """Get the optimally spaced points inside a boundary polygon"""
    shapely_boundary = Polygon(boundary)
    diameter = np.linalg.norm(boundary.ptp(axis=0))
    points = starters
    for step in range(20):
        regions = []
        new_points = []
        for unbounded_region in voronoi_polygons(Voronoi(points), diameter):
            region = unbounded_region.intersection(shapely_boundary)
            regions.append(region)
            new_points.append(np.array(region.centroid))
        new_points = np.stack(new_points)
        points = new_points
    return points, regions


def voronoi_polygons(
    voronoi: Voronoi, diameter: float
) -> Generator[Polygon, None, None]:
    """Generate polygons objects corresponding to the regions of a Voronoi object"""
    centroid = voronoi.points.mean(axis=0)

    # Mapping from (input point index, Voronoi point index) to list of
    # unit vectors in the directions of the infinite ridges starting
    # at the Voronoi point and neighbouring the input point.
    ridge_direction = defaultdict(list)
    for (p, q), rv in zip(voronoi.ridge_points, voronoi.ridge_vertices):
        u, v = sorted(rv)
        if u == -1:
            # Infinite ridge starting at ridge point with index v,
            # equidistant from input points with indexes p and q.
            t = voronoi.points[q] - voronoi.points[p]  # tangent
            n = np.array([-t[1], t[0]]) / np.linalg.norm(t)  # normal
            midpoint = voronoi.points[[p, q]].mean(axis=0)
            direction = np.sign(np.dot(midpoint - centroid, n)) * n
            ridge_direction[p, v].append(direction)
            ridge_direction[q, v].append(direction)

    for i, r in enumerate(voronoi.point_region):
        region = voronoi.regions[r]
        if -1 not in region:
            # Finite region.
            yield Polygon(voronoi.vertices[region])
            continue
        # Infinite region.
        inf = region.index(-1)  # Index of vertex at infinity.
        j = region[(inf - 1) % len(region)]  # Index of previous vertex.
        k = region[(inf + 1) % len(region)]  # Index of next vertex.
        if j == k:
            # Region has one Voronoi vertex with two ridges.
            dir_j, dir_k = ridge_direction[i, j]
        else:
            # Region has two Voronoi vertices, each with one ridge.
            (dir_j,) = ridge_direction[i, j]
            (dir_k,) = ridge_direction[i, k]

        # Length of ridges needed for the extra edge to lie at least
        # 'diameter' away from all Voronoi vertices.
        length = 2 * diameter / np.linalg.norm(dir_j + dir_k)

        # Polygon consists of finite part plus an extra edge.
        finite_part = voronoi.vertices[region[inf + 1 :] + region[:inf]]
        extra_edge = [
            voronoi.vertices[j] + dir_j * length,
            voronoi.vertices[k] + dir_k * length,
        ]
        yield Polygon(np.concatenate((finite_part, extra_edge)))
