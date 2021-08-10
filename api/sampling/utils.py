import numpy as np


def bounding_box(points: np.ndarray) -> np.ndarray:
    """Bound a set of points with the smallest possible bounding box"""
    min_x = np.min(points[:, 0])
    max_x = np.max(points[:, 0])
    min_y = np.min(points[:, 1])
    max_y = np.max(points[:, 1])
    return np.array(
        [
            [min_x, max_y],
            [max_x, max_y],
            [max_x, min_y],
            [min_x, min_y],
        ]
    )
