from typing import List, Tuple

import alphashape
import numpy as np
import py3dep
import utm
from scipy.interpolate import griddata
from shapely.geometry import Point, Polygon


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
    utm_polygon: np.ndarray, z_number: int, z_letter: str
) -> Tuple[List[np.ndarray], List[str]]:
    x_min, y_min = utm_polygon.min(0)
    x_max, y_max = utm_polygon.max(0)
    # 5-meter grid
    xx, yy = np.meshgrid(np.arange(x_min, x_max, 5), np.arange(y_min, y_max, 5))
    xx = xx.ravel()
    yy = yy.ravel()
    grid = np.stack((xx, yy), -1)
    lat, lon = utm.to_latlon(grid[:, 0], grid[:, 1], z_number, z_letter)
    elevation = np.array(py3dep.elevation_bycoords(np.stack([lon, lat], -1)))

    data = elevation[:, None]

    # ecad = data[:, 3]
    # ecad_mask = ~np.isnan(ecad)
    # ecad_grid = griddata(
    #     data[ecad_mask, 1:3],
    #     ecad[ecad_mask],
    #     grid,
    #     method="nearest",
    # )

    grid_mask = np.zeros(len(grid)).astype(bool)
    poly = Polygon(utm_polygon)
    for i, p in enumerate(map(Point, grid)):
        if poly.contains(p):
            grid_mask[i] = True

    if grid_mask.sum() == 0:
        return

    cluster_points = data[grid_mask]
    classes, _ = kmeans(cluster_points)

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
        description = f"Cluster: {i+1}"
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
