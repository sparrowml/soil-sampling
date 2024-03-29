import numpy as np
from shapely.geometry import Point, Polygon

# TODO: make this programmatic so it can be any value
SQUARE_SIDE = {
    "1": 63.615,
    "2.5": 100.584,
    "5": 142.247,
}


def in_polygon_filter(grid: np.ndarray, polygon: np.ndarray) -> np.ndarray:
    """Filter out grid points that are not in the polygon."""
    shapely_polygon = Polygon(polygon)
    keepers = []
    for point in grid:
        if shapely_polygon.contains(Point(point)):
            keepers.append(point)
    return np.array(keepers)


def boundary_distance_filter(
    grid: np.ndarray, polygon: np.ndarray, threshold: float
) -> np.ndarray:
    """Filter out grid points that are within <threshold> of the polygon boundary."""
    shapely_polygon = Polygon(polygon)
    keepers = []
    for point in grid:
        if shapely_polygon.exterior.distance(Point(point)) > threshold:
            keepers.append(point)
    return np.array(keepers)


def uniform_sample(
    polygon: np.ndarray, acre: str = "1", triangle_offset: bool = False
) -> np.ndarray:
    """Generate a uniform grid that covers an entire polygon."""
    x_min = polygon[:, 0].min()
    x_max = polygon[:, 0].max()
    y_min = polygon[:, 1].min()
    y_max = polygon[:, 1].max()

    i = 1
    grid = []
    while x_min + i * SQUARE_SIDE[acre] / 2 < x_max:
        j = 1
        offset = SQUARE_SIDE[acre] / 4 if triangle_offset else 0
        while y_min + j * SQUARE_SIDE[acre] / 2 < y_max:
            if j % 2 == 0 and triangle_offset:
                offset = SQUARE_SIDE[acre] / 4
            else:
                offset = 0
            grid.append(
                [
                    x_min + i * SQUARE_SIDE[acre] / 2 + offset,
                    y_min + j * SQUARE_SIDE[acre] / 2,
                ]
            )
            j += 1
        i += 1
    grid = np.array(grid)
    grid = in_polygon_filter(grid, polygon)
    grid = boundary_distance_filter(grid, polygon, SQUARE_SIDE[acre] / 4)
    return grid
