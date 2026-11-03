from typing import List, Optional, Tuple

import numpy as np
import pandas as pd
import py3dep
import utm
from scipy.interpolate import griddata
from scipy.spatial import cKDTree
from shapely.geometry import Point, Polygon, LineString, box
from shapely.ops import split, unary_union, triangulate

from .exceptions import DimensionException


def enrich_points(
    utm_sample_points: np.ndarray, z_number: int, z_letter: str
) -> List[str]:
    lat, lon = utm.to_latlon(
        utm_sample_points[:, 0], utm_sample_points[:, 1], z_number, z_letter
    )
    elevation = np.array(py3dep.elevation_bycoords(np.stack([lon, lat], -1)))
    point_enrichments = []
    for i in range(len(utm_sample_points)):
        description = f"Elevation: {elevation[i]:.2f}"
        point_enrichments.append(description)
    return point_enrichments


def cluster_regions(
    utm_polygon: np.ndarray,
    z_number: int,
    z_letter: str,
    include_elevation: bool,
    point_data: Optional[pd.DataFrame] = None,
) -> Tuple[List[np.ndarray], List[str]]:
    x_min, y_min = utm_polygon.min(0)
    x_max, y_max = utm_polygon.max(0)
    # 5-meter grid
    xx, yy = np.meshgrid(np.arange(x_min, x_max, 5), np.arange(y_min, y_max, 5))
    xx = xx.ravel()
    yy = yy.ravel()
    grid = np.stack((xx, yy), -1)
    lat, lon = utm.to_latlon(grid[:, 0], grid[:, 1], z_number, z_letter)

    dimensions = []
    if include_elevation:
        elevation = np.array(py3dep.elevation_bycoords(np.stack([lon, lat], -1)))
        dimensions.append(elevation[:, None])

    if point_data is not None:
        p_x, p_y, _, __ = utm.from_latlon(
            point_data.lat.values, point_data.lon.values, z_number, z_letter
        )
        point_grid = np.stack([p_x, p_y], -1)
        point_columns = []
        n_columns = 0
        for c in point_data.columns:
            if c in ("lat", "lon"):
                continue
            n_columns += 1
            values = point_data[c].values
            mask = ~np.isnan(values)
            point_column = griddata(
                point_grid[mask],
                values[mask],
                grid,
                method="nearest",
            )
            point_columns.append(point_column)
        point_data = np.stack(point_columns, -1)
        dimensions.append(point_data)
    data = np.concatenate(dimensions, -1)
    if data.shape[1] > 3:
        raise DimensionException("Too many dimensions for clustering")
    grid_mask = np.zeros(len(grid)).astype(bool)
    poly = Polygon(utm_polygon)
    for i, p in enumerate(map(Point, grid)):
        if poly.contains(p):
            grid_mask[i] = True

    if grid_mask.sum() == 0:
        raise ValueError("The area of interest is too narrow for the 5-meter clustering grid. Enlarge it and try again.")

    cluster_points = data[grid_mask]
    classes, _ = kmeans(cluster_points)

    return grid_regions(poly, grid, grid_mask, classes)


def polygon_parts(geometry):
    if geometry.is_empty:
        return
    if isinstance(geometry, Polygon):
        yield geometry
    elif hasattr(geometry, "geoms"):
        for part in geometry.geoms:
            yield from polygon_parts(part)


def exterior_parts(geometry):
    """Split holes without changing area: the public API supports exterior rings only."""
    pending = list(polygon_parts(geometry))
    while pending:
        poly = pending.pop()
        if not poly.interiors:
            yield poly
            continue
        hole = Polygon(poly.interiors[0])
        y = hole.representative_point().y
        xmin, _, xmax, _ = poly.bounds
        pieces = split(poly, LineString([(xmin - 1, y), (xmax + 1, y)]))
        pending.extend(polygon_parts(pieces))


def grid_regions(poly, grid, mask, classes):
    """Partition the AOI using nearest-neighbor labels on the existing 5m grid.

    Unlabelled boundary sites inherit their closest labelled site's class. Cell
    edges lie midway between grid sites; the outer cells extend to the AOI bounds.
    Row runs avoid constructing a separate geometry for every grid cell.
    """
    labels = np.empty(len(grid), dtype=int)
    labels[mask] = classes
    if (~mask).any():
        _, nearest = cKDTree(grid[mask]).query(grid[~mask])
        labels[~mask] = classes[nearest]
    xs, ys = np.unique(grid[:, 0]), np.unique(grid[:, 1])
    xmin, ymin, xmax, ymax = poly.bounds
    xe = np.r_[xmin, (xs[:-1] + xs[1:]) / 2, xmax]
    ye = np.r_[ymin, (ys[:-1] + ys[1:]) / 2, ymax]
    labels = labels.reshape(len(ys), len(xs))
    runs = {int(label): [] for label in np.unique(labels)}
    for row, values in enumerate(labels):
        edges = np.r_[0, np.flatnonzero(values[1:] != values[:-1]) + 1, len(xs)]
        for start, end in zip(edges[:-1], edges[1:]):
            runs[int(values[start])].append(box(xe[start], ye[row], xe[end], ye[row + 1]))
    regions, descriptions = [], []
    for label, rectangles in sorted(runs.items()):
        geometry = unary_union(rectangles).intersection(poly)
        for part in exterior_parts(geometry):
            regions.append(np.asarray(part.exterior.coords))
            descriptions.append(f"Cluster: {label + 1}")
    return regions, descriptions


def sample_fragment(poly, count):
    """Fallback for narrow/concave pieces the existing sampler cannot populate."""
    triangles = [triangle for triangle in triangulate(poly) if poly.covers(triangle)]
    if not triangles:
        return np.repeat(np.asarray(poly.representative_point().coords), count, axis=0)
    weights = np.array([triangle.area for triangle in triangles])
    chosen = np.random.choice(len(triangles), size=count, p=weights / weights.sum())
    points = []
    for index in chosen:
        vertices = np.asarray(triangles[index].exterior.coords)[:3]
        u, v = np.random.random(2)
        if u + v > 1:
            u, v = 1 - u, 1 - v
        points.append(vertices[0] + u * (vertices[1] - vertices[0]) + v * (vertices[2] - vertices[0]))
    return np.asarray(points)


def initialize_centroids(points: np.ndarray, k: int = 3) -> np.ndarray:
    """Returns k centroids from the initial points"""
    centroids = points.copy()
    np.random.shuffle(centroids)
    return centroids[:k]


def closest_centroid(points: np.ndarray, centroids: np.ndarray) -> np.ndarray:
    deltas = points - centroids[:, None]
    indices = np.argmin(np.linalg.norm(deltas, axis=-1), axis=0)
    score = np.linalg.norm(deltas)
    return indices, score


def move_centroids(
    points: np.ndarray, closest: np.ndarray, centroids: np.ndarray
) -> np.ndarray:
    return np.array(
        [points[closest == k].mean(axis=0) for k in range(centroids.shape[0])]
    )


def kmeans(points: np.ndarray, k: int = 3) -> Tuple[np.ndarray, np.ndarray]:
    prev_score = np.inf
    centroids = initialize_centroids(points, k)
    for _ in range(300):
        classes, score = closest_centroid(points, centroids)
        if np.abs(score - prev_score) < 0.0001:
            break
        prev_score = score
        centroids = move_centroids(points, classes, centroids)
    return classes, centroids
