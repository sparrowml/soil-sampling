from typing import List, Tuple

import alphashape
import numpy as np
from scipy.interpolate import griddata
from shapely.geometry import Point, Polygon, MultiPolygon
from sklearn import cluster
from sklearn.cluster import KMeans


def cluster_regions(
    polygon: np.ndarray, data: np.ndarray
) -> Tuple[List[np.ndarray], List[str]]:
    x_min, y_min = data[:, 1:3].min(0)
    x_max, y_max = data[:, 1:3].max(0)
    # 5-meter grid
    xx, yy = np.meshgrid(np.arange(x_min, x_max, 5), np.arange(y_min, y_max, 5))
    shape = xx.shape
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

    if has_elevation:
        cluster_points = np.stack((ecad_grid[grid_mask], elevation_grid[grid_mask]), -1)
    else:
        cluster_points = ecad_grid[grid_mask][:, None]
    model = KMeans(3).fit(cluster_points)
    classes = model.predict(cluster_points)

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
            _ecad, _elevation = model.cluster_centers_[i]
            description = (
                f"Cluster: {i+1}; ECaD: {_ecad:.12f}; Elevation: {_elevation:.2f}"
            )
        else:
            (_ecad,) = model.cluster_centers_[i]
            description = f"Cluster: {i+1}; ECaD: {_ecad:.12f}"
        if isinstance(multips[i], Polygon):
            regions.append(np.array(multips[i].exterior))
            region_descriptions.append(description)
            continue
        for p in multips[i]:
            regions.append(np.array(p.exterior))
            region_descriptions.append(description)

    return regions, region_descriptions
