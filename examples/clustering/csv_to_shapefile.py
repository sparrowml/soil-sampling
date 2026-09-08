"""Convert the video's CSV layout into the current API's point shapefile ZIP."""
import argparse
from pathlib import Path
import tempfile
import zipfile

import geopandas as gpd
import numpy as np
import pandas as pd


def convert(source, destination):
    data = pd.read_csv(source)
    required = ["ID", "Latitude", "Longitude", "ECaD"]
    if not set(required).issubset(data.columns):
        raise ValueError(f"Required columns: {required}")
    features = ["ECaD"] + (["Elevation"] if "Elevation" in data else [])
    for column in ["Latitude", "Longitude"] + features:
        data[column] = pd.to_numeric(data[column], errors="raise")
    coordinates = data[["Latitude", "Longitude"]].to_numpy()
    if not np.isfinite(coordinates).all():
        raise ValueError("Coordinates must be finite")
    if not data.Latitude.between(-90, 90).all() or not data.Longitude.between(-180, 180).all():
        raise ValueError("Coordinates must be WGS84 degrees")
    for column in features:
        if np.isinf(data[column]).any() or not data[column].notna().any():
            raise ValueError(f"{column} needs finite observations; NaN is allowed")
    # Only measurement attributes: the API clusters every non-coordinate column.
    # ID must not become a clustering dimension. Coordinates live in geometry.
    points = gpd.GeoDataFrame(
        data[features],
        geometry=gpd.points_from_xy(data.Longitude, data.Latitude),
        crs="EPSG:4326",
    )
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "points.shp"
        points.to_file(path, driver="ESRI Shapefile", index=False)
        with zipfile.ZipFile(destination, "w", zipfile.ZIP_DEFLATED) as archive:
            for component in sorted(Path(directory).glob("points.*")):
                archive.write(component, component.name)
    return len(points)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv", type=Path)
    parser.add_argument("zip", type=Path)
    args = parser.parse_args()
    print(f"Wrote {convert(args.csv, args.zip)} points to {args.zip}")
