import fire

from .utils import read_shapefile_zip, zip_shapefile


def main() -> None:
    """Call CLI commands."""
    fire.Fire(
        {
            "read-shapefile": read_shapefile_zip,
            "zip-shapefile": zip_shapefile,
        }
    )
