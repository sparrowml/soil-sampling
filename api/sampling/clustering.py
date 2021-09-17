from typing import List, Tuple

import alphashape
import numpy as np
from scipy.interpolate import griddata
from shapely.geometry import Point, Polygon


def enrich_points(points: np.ndarray, data: np.ndarray) -> List[str]:
    ecad = data[:, 3]
    ecad_mask = ~np.isnan(ecad)
    ecad_grid = griddata(
        data[ecad_mask, 1:3],
        ecad[ecad_mask],
        points,
        method="nearest",
    )

    has_elevation = data.shape[1] > 4
    if has_elevation:
        elevation = data[:, 4]

        elevation_mask = ~np.isnan(elevation)
        elevation_grid = griddata(
            data[elevation_mask, 1:3],
            elevation[elevation_mask],
            points,
            method="nearest",
        )
    point_enrichments = []
    for i in range(len(points)):
        if has_elevation:
            description = (
                f"ECaD: {ecad_grid[i]:.12f}; Elevation: {elevation_grid[i]:.2f}"
            )
        else:
            description = f"ECaD: {ecad_grid[i]:.12f}"
        point_enrichments.append(description)
    return point_enrichments


def cluster_regions(
    polygon: np.ndarray, data: np.ndarray
) -> Tuple[List[np.ndarray], List[str]]:
    x_min, y_min = polygon.min(0)
    x_max, y_max = polygon.max(0)
    # 5-meter grid
    xx, yy = np.meshgrid(np.arange(x_min, x_max, 5), np.arange(y_min, y_max, 5))
    xx = xx.ravel()
    yy = yy.ravel()
    grid = np.stack((xx, yy), -1)

    ecad = data[:, 3]
    ecad_mask = ~np.isnan(ecad)
    ecad_grid = griddata(
        data[ecad_mask, 1:3],
        ecad[ecad_mask],
        grid,
        method="nearest",
    )

    has_elevation = data.shape[1] > 4

    if has_elevation:
        elevation = data[:, 4]

        elevation_mask = ~np.isnan(elevation)
        elevation_grid = griddata(
            data[elevation_mask, 1:3],
            elevation[elevation_mask],
            grid,
            method="nearest",
        )

    grid_mask = np.zeros(len(grid)).astype(bool)
    poly = Polygon(polygon)
    for i, p in enumerate(map(Point, grid)):
        if poly.contains(p):
            grid_mask[i] = True

    if grid_mask.sum() == 0:
        return

    if has_elevation:
        cluster_points = np.stack((ecad_grid[grid_mask], elevation_grid[grid_mask]), -1)
    else:
        cluster_points = ecad_grid[grid_mask][:, None]
    classes, centroids = kmeans(cluster_points)

    all_pixels = np.zeros(xx.shape) * np.nan
    all_pixels[grid_mask] = classes
    multips = []
    for i in range(3):
        class_mask = all_pixels[grid_mask] == i
        class_points = np.stack(
            (xx[grid_mask][class_mask], yy[grid_mask][class_mask]), -1
        )
        polys = alphashape.alphashape(class_points, 0.2)
        multips.append(polys)

    for i in range(len(multips)):
        if isinstance(multips[i], Polygon):
            continue
        for p in multips[i]:
            if p.area / multips[i].area < 0.1:
                multips[i] -= p

    for i in range(len(multips)):
        for j in range(len(multips)):
            if i == j:
                continue
            if multips[i].area > multips[j].area:
                multips[i] -= multips[j]
            else:
                multips[j] -= multips[i]

    for i in range(len(multips)):
        if isinstance(multips[i], Polygon):
            continue
        for p in multips[i]:
            if p.area / multips[i].area < 0.1:
                multips[i] -= p

    regions = []
    region_descriptions = []
    for i in range(len(multips)):
        if has_elevation:
            _ecad, _elevation = centroids[i]
            description = (
                f"Cluster: {i+1}; ECaD: {_ecad:.12f}; Elevation: {_elevation:.2f}"
            )
        else:
            (_ecad,) = centroids[i]
            description = f"Cluster: {i+1}; ECaD: {_ecad:.12f}"
        if isinstance(multips[i], Polygon):
            regions.append(np.array(multips[i].exterior))
            region_descriptions.append(description)
            continue
        for p in multips[i]:
            regions.append(np.array(p.exterior))
            region_descriptions.append(description)

    return regions, region_descriptions


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
