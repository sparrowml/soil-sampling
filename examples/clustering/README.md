# CSV to clustering: current USDA API

This example adapts the older video's CSV workflow to the current
`https://pdi-staging.scinet.usda.gov/clustering` API. It does not restore a CSV
upload button in the web UI.

## Files

- [points.csv](points.csv): **synthetic demonstration data**, not field measurements.
  441 points on a 15-meter lattice over a 300 × 300 meter square in Nebraska.
  ECaD and elevation vary smoothly across the square; units are illustrative.
- [points.zip](points.zip): matching point shapefile archive in WGS84 (EPSG:4326).
- [request.json](request.json): matching longitude/latitude boundary and hosted ZIP URL.
- [csv_to_shapefile.py](csv_to_shapefile.py): conversion from the video's CSV columns.
- [run_hosted.py](run_hosted.py): request to the hosted USDA service and response checks.

The original README's S3 sample URL returned HTTP 403 on September 8, 2026.
This sample is independent synthetic data, not a copy of that inaccessible file.

## Try the hosted endpoint

From the repository root, using Python 3 (standard library only):

```sh
python3 examples/clustering/run_hosted.py
```

Or submit the same request with curl:

```sh
curl --fail-with-body --max-time 180 \
  https://pdi-staging.scinet.usda.gov/clustering \
  -H 'Content-Type: application/json' \
  --data-binary @examples/clustering/request.json \
  -o response.json
```

## Convert another CSV

Use a Python 3.11 environment with the repository's pinned dependencies:

```sh
uv venv --python 3.11
uv pip install -r requirements-main.txt
.venv/bin/python examples/clustering/csv_to_shapefile.py input.csv output.zip
```

Required CSV columns are `ID,Latitude,Longitude,ECaD`; `Elevation` is optional.
Coordinates must be valid WGS84 degrees. Measurements must be numeric; missing
measurements are allowed provided each measurement column has finite observations.
Upload the resulting ZIP to a URL accessible to the USDA server, then replace
`pointDataShapefile` and `polygon` in the request with your own data.

The archive contains `.shp`, `.shx`, `.dbf`, `.prj`, and `.cpg` files at its root.
Only `ECaD` and optional `Elevation` become shapefile attributes. **Do not retain
ID as an attribute:** the backend clusters on every attribute except `lat` and
`lon`. Coordinates are stored in the point geometry. The current reader assumes
WGS84 geometry; it does not reproject an arbitrary source CRS for you.

## What the algorithm consumes

Current flow: CSV → point shapefile ZIP → downloaded GeoDataFrame → UTM
coordinates → nearest-neighbor interpolation onto a 5-meter grid → K-means
clustering → region polygons and sample points. The ID and coordinates are not
clustering features. No feature standardization is performed, so measurement
scales affect clustering.

`includeElevation: false` means no additional elevation feature is fetched for
clustering: this example already supplies an `Elevation` attribute. The endpoint
still fetches external elevation for the returned sample-point descriptions.
Thus it is not an offline endpoint even with this flag set to false.

The older video version sent CSV text in JSON's `data` field and parsed it
straight into a numeric array before the grid step; it did not make a shapefile.
The current endpoint expects `pointDataShapefile`, not that old `data` field.

K-means initialization is random and sample counts are rounded per region.
Repeated calls can return different polygons, labels, coordinates, and counts;
`nPoints` is a target rather than a guarantee of an exact count.

## Hosted verification — September 8, 2026

Both the curl command and Python runner succeeded against the hosted USDA
endpoint: HTTP 200, three cluster regions and eight sample points from 441 input
measurements (`nPoints: 9`). See [response.json](response.json) for the actual
Python-run response. No services or elevation results were mocked. The curl
response was additionally checked for valid region polygons, finite sample
coordinates, points within the requested boundary, and consistent response lengths.

On this Mac, Python needed the system CA bundle configured explicitly; curl
worked with its normal trust settings. If your Python installation has the same
certificate-chain error and this system bundle is available, use:

```sh
SSL_CERT_FILE=/etc/ssl/cert.pem python3 examples/clustering/run_hosted.py
```

TLS verification remains enabled.
