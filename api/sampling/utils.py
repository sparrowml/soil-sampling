import numpy as np


def get_utm_string(point: np.ndarray) -> str:
    zone = int((np.floor((point[0] + 180) / 6) % 60) + 1)
    return f"+proj=utm +zone={zone} +ellps=GRS80 +datum=NAD83 +units=m +no_defs"
