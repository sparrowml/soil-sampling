import numpy as np
from shapely.geometry import Polygon, Point

from .constants import BOUNDARY_THRESHOLD, SQUARE_SIDE, ACRE


def in_polygon_filter(grid: np.ndarray, polygon: Polygon) -> np.ndarray:
    """Filter out grid points that are not in the polygon."""
    keepers = []
    for point in grid:
        if polygon.contains(Point(point)):
            keepers.append(point)
    return np.array(keepers)


def boundary_distance_filter(grid: np.ndarray, polygon: Polygon) -> np.ndarray:
    """Filter out grid points that are within <threshold> of the polygon boundary."""
    keepers = []
    for point in grid:
        if polygon.exterior.distance(Point(point)) > BOUNDARY_THRESHOLD:
            keepers.append(point)
    return np.array(keepers)


def uniform_grid(polygon: np.ndarray) -> np.ndarray:
    """Generate a uniform grid that covers an entire polygon."""
    x_min = polygon[:, 0].min()
    x_max = polygon[:, 0].max()
    y_min = polygon[:, 1].min()
    y_max = polygon[:, 1].max()

    i = 1
    grid = []
    while x_min + i * SQUARE_SIDE[ACRE] / 2 < x_max:
        j = 1
        while y_min + j * SQUARE_SIDE[ACRE] / 2 < y_max:
            grid.append(
                [
                    x_min + i * SQUARE_SIDE[ACRE] / 2,
                    y_min + j * SQUARE_SIDE[ACRE] / 2,
                ]
            )
            j += 1
        i += 1
    return np.array(grid)
