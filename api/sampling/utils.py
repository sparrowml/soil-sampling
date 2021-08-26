import numpy as np
from shapely.geometry import Polygon


def order_points(points: np.ndarray) -> np.ndarray:
    meter_bin = 25
    dim1_bins = np.array(
        [str(int(m / meter_bin)).zfill(3) for m in points[:, 0] - points[:, 0].min()]
    )
    dim2_bins = np.array(
        [str(int(m / meter_bin)).zfill(3) for m in points[:, 1] - points[:, 1].min()]
    )

    sort_order = -1
    indices = np.arange(len(points))

    for dim1 in sorted(set(dim1_bins)):
        sort_order *= -1
        if sort_order == -1:
            continue
        mask = np.argwhere(dim1_bins == dim1).ravel()
        dim2_indices = indices[mask][np.argsort(dim2_bins[mask])]
        dim2_bins[dim2_indices] = dim2_bins[dim2_indices][::-1]
    binstrings = np.array([t[0] + t[1] for t in zip(dim1_bins, dim2_bins)])
    return points[np.argsort(binstrings)]


def get_utm_string(point: np.ndarray) -> str:
    zone = int((np.floor((point[0] + 180) / 6) % 60) + 1)
    return f"+proj=utm +zone={zone} +ellps=GRS80 +datum=NAD83 +units=m +no_defs"


def check_area(polygon: np.ndarray) -> None:
    if Polygon(polygon).area > 10359900:
        raise ValueError("Polygon too large")
