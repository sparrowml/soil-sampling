import io
import tempfile
import zipfile
from pathlib import Path
from typing import Union

import geopandas as gpd
import numpy as np
import pandas as pd
import requests
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


def check_area(polygon: np.ndarray) -> None:
    if Polygon(polygon).area > 10359900:
        raise ValueError("Polygon too large")


def read_file(data: str) -> np.ndarray:
    for i in range(3):
        try:
            return np.loadtxt(io.StringIO(data), delimiter=",", skiprows=i)
        except ValueError:
            continue
    return np.loadtxt(io.StringIO(data), delimiter=",", skiprows=i + 1)


def zip_shapefile(shapefile_folder: Union[str, Path]) -> Path:
    """Zip a shapefile folder."""
    shapefile_folder = Path(shapefile_folder)
    assert shapefile_folder.is_dir()
    zip_path = shapefile_folder.with_suffix(".zip")
    with zipfile.ZipFile(zip_path, "w") as zf:
        for file in shapefile_folder.iterdir():
            zf.write(file, file.name)


def read_shapefile_zip(shapefile_zip: Union[str, Path]) -> pd.DataFrame:
    """Read a zipped shapefile."""
    shapefile_zip = Path(shapefile_zip)
    assert shapefile_zip.is_file()
    with tempfile.TemporaryDirectory() as tmpdir:
        with zipfile.ZipFile(shapefile_zip, "r") as zf:
            zf.extractall(tmpdir)
        shapefile_path = next(Path(tmpdir).glob("*.shp"))
        gdf = gpd.read_file(shapefile_path)
    gdf["lon"] = gdf.geometry.map(lambda x: x.coords[0][0])
    gdf["lat"] = gdf.geometry.map(lambda x: x.coords[0][1])
    del gdf["geometry"]
    return gdf


def download_shapefile(url: str) -> pd.DataFrame:
    """Download a shapefile from a URL."""
    response = requests.get(url)
    with tempfile.TemporaryDirectory() as tmpdir:
        p = Path(tmpdir) / "shapefile.zip"
        with open(p, "wb") as f:
            f.write(response.content)
        return read_shapefile_zip(p)
