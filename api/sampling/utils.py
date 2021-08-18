import numpy as np
from shapely.geometry import Polygon


def get_utm_string(point: np.ndarray) -> str:
    zone = int((np.floor((point[0] + 180) / 6) % 60) + 1)
    return f"+proj=utm +zone={zone} +ellps=GRS80 +datum=NAD83 +units=m +no_defs"


def check_area(polygon: np.ndarray) -> None:
    if Polygon(polygon).area > 10359900:
        raise ValueError("Polygon too large")
