# Soil Sampling API Docs

## Description

Endpoints for running soil sampling algorithms

## Base URL

The USDA staging base URL is:

`https://pdi-staging.scinet.usda.gov`

The CSV-upload test deployment for frontend integration uses
[https://sspot.ngrok.dev](https://sspot.ngrok.dev). Use this test base URL for the
new multipart example below; the PR remains open during frontend development.

## Endpoints

## `GET /`

Basic status check

### Response

Returns a JSON object with the following properties:

- `message`: A friendly hello world message

## `POST /uniform`

Uniform soil sampling algorithm

### Parameters

- `polygon`: A 2-dimensional longitude, latitude polygon array
- `acre` (optional): A string representing the sample area. Must be `"1"`, `"2.5"` or `"5"`. Defaults to `"1"`.
- `triangleOffset` (optional): Whether to offset each row. Defaults to `true`.

### Response

Returns a JSON object with the following properties:

- `points`: A 2-dimensional longitude, latitude array of points sampled points

### Example

Request:

```
POST /uniform
```

Payload:

```json
{
    "polygon": [
        [
            -96.47349202944932,
            41.163400144165884
        ],
        [
            -96.47609289377534,
            41.16171212173477
        ],
        [
            -96.47257604473643,
            41.16149985236383
        ],
        [
            -96.47349202944932,
            41.163400144165884
        ]
    ],
    "acre": "5",
    "triangleOffset": false
}
```

Response:

```json
{
    "points": [
        [
            -96.47437961680313,
            41.1621800645001
        ],
        [
            -96.47353267490183,
            41.16216147915089
        ]
    ]
}
```

## `POST /voronoi`

Soil Map Unit sampling algorithm

### Parameters

- `polygon`: A 2-dimensional longitude, latitude polygon array
- `nPoints` (optional): The number of points to sample. Defaults to `10`.

### Response

Returns a JSON object with the following properties:

- `points`: A 2-dimensional longitude, latitude array of points sampled points
- `mukey_ids`: A list of MUKEY IDs. Each MUKEY ID corresponds with the element of `points` at the same index.
- `regions`: A 3-dimensional list of polygons. Each polygon is a 2-dimensional longitude, latitude polygon array representing one of the MUKEY regions.
- `region_mukey_ids`: A list of MUKEY IDs. Each MUKEY ID corresponds with the element of `regions` at the same index.

### Example

Request:

```
POST /voronoi
```

Payload:

```json
{
    "polygon": [
        [
            -96.47714969196127,
            41.16848436254755
        ],
        [
            -96.48187893247393,
            41.163823082035805
        ],
        [
            -96.47407812338051,
            41.16283205839988
        ],
        [
            -96.47714969196127,
            41.16848436254755
        ]
    ],
    "nPoints": 4
}
```

Response:

```json
{
    "mukey_ids": [
        "1691417",
        "1691417",
        "1691452"
    ],
    "points": [
        [
            -96.47861097029795,
            41.16588936941245
        ],
        [
            -96.47864390795681,
            41.165030639436615
        ],
        [
            -96.47655479493278,
            41.16489179590992
        ]
    ],
    "region_mukey_ids": [
        "1691417",
        "1691417",
        "1691452",
        "2745842",
        "1691418",
        "2745842",
        "1691452",
        "1691452"
    ],
    "regions": [
        [
            [
                -96.47714969196127,
                41.16848436254755
            ],
            [
                -96.47664499904543,
                41.16755562604484
            ],
			
            [
                -96.47714969196127,
                41.16848436254755
            ]
        ],
		
    ]
}
```

## `POST /cema221`

CEMA 221 sampling algorithms. The algorithms here are very similar to `/voronoi` except that there is a limit to the number of regions per polygon and the number of points per region.

### Parameters

- `polygon`: A 2-dimensional longitude, latitude polygon array
- `nPoints` (optional): The number of points to sample. Defaults to `10`.

### Response

Returns a JSON object with the following properties:

- `points`: A 2-dimensional longitude, latitude array of points sampled points
- `mukey_ids`: A list of MUKEY IDs. Each MUKEY ID corresponds with the element of `points` at the same index.
- `regions`: A 3-dimensional list of polygons. Each polygon is a 2-dimensional longitude, latitude polygon array representing one of the MUKEY regions.
- `region_mukey_ids`: A list of MUKEY IDs. Each MUKEY ID corresponds with the element of `regions` at the same index.

### Example

Request:

```
POST /cema221
```

Payload:

```json
{
    "polygon": [
        [
            -96.46403155701587,
            41.16309069075756
        ],
        [
            -96.46636300283083,
            41.161335463745964
        ],
        [
            -96.46400983547113,
            41.16123189298148
        ],
        [
            -96.46403155701587,
            41.16309069075756
        ]
    ],
    "nPoints": 6
}
```

Response:

```json
{
  "mukey_ids": [
    "1691417",
    "1691417",
    "2745842",
    "2745842",
    "1691418",
    "1691418"
  ],
  "points": [
    [
      -96.46563585425629,
      41.16152043912582
    ],
    [
      -96.46515044622541,
      41.1616603577914
    ],
    [
      -96.4649155377209,
      41.16227098607845
    ],
    [
      -96.46462717681882,
      41.16251687356174
    ],
    [
      -96.46439307729652,
      41.16211135545011
    ],
    [
      -96.46426634563524,
      41.161791841068045
    ]
  ],
  "region_mukey_ids": [
    "1691417",
    "2745842",
    "1691418"
  ],
  "regions": [
    [
      [
        -96.46462629742274,
        41.16264294094484
      ],
      [
        -96.464424,
        41.16262
      ],
			
      [
        -96.46462629742274,
        41.16264294094484
      ]
    ],
		
  ],
  "voronoi_regions": []
}
```

## `POST /clustering`

Cluster field measurements and return sampling points and regions. The existing
endpoint accepts either a CSV upload (`multipart/form-data`) or the legacy JSON
request containing `pointDataShapefile` and/or `includeElevation`.

### CSV format

Use UTF-8 CSV with a header containing `lon`, `lat`, and one to three numeric
measurement columns. Coordinates are WGS84 longitude/latitude (UTM coverage:
latitude -80 to 84, longitude -180 to 180). All values must be finite numbers;
blank cells, duplicate headers and extra text columns are rejected. Include at
least three rows, three distinct locations and three distinct measurement value
combinations. At most 10000 rows are accepted. These are synthetic example
measurements, not agricultural recommendations:

```csv
lon,lat,yield
-96.470000,41.163000,110
-96.469250,41.163000,130
-96.468500,41.163000,150
```

The complete [public sample CSV](https://sparrowcomputing.s3.amazonaws.com/soil-sampling/examples/clustering-v1.csv)
is also in `examples/clustering.csv`. Its matching polygon and options are in
`examples/clustering.json`.

### Multipart fields

- `pointDataCsv`: exactly one CSV file.
- `options`: a JSON object with `polygon`, optional `nPoints` (integer 1–200,
  default 10), and optional `includeElevation` (boolean, default false).
- Instead of `options`, individual form fields `polygon`, `nPoints`, and
  `includeElevation` are accepted; each value must be JSON encoded. Do not mix
  the two option styles.

`polygon` is an array of longitude/latitude pairs forming a valid polygon.
Including elevation uses one of the maximum three clustering dimensions. CSV and
shapefile input cannot be combined in one request. The server does not fetch CSV
URLs: download the sample, then upload it directly.

### Example

From the repository root, against the public test deployment:

```sh
curl --fail --location \
  https://sparrowcomputing.s3.amazonaws.com/soil-sampling/examples/clustering-v1.csv \
  --output /tmp/clustering.csv
curl --fail-with-body https://sspot.ngrok.dev/clustering \
  --form 'pointDataCsv=@/tmp/clustering.csv;type=text/csv' \
  --form 'options=<examples/clustering.json'
```

Browser clients can append a `File` as `pointDataCsv` and
`JSON.stringify(options)` as `options` to `FormData`. Let the browser set the
Content-Type header including its multipart boundary.

Existing JSON clients can continue sending `polygon`, `nPoints`,
`includeElevation`, and `pointDataShapefile` (a URL to a zipped shapefile).

### Response and limits

The response shape is unchanged: `points`, `point_descriptions`,
`point_enrichments`, `regions`, and `region_descriptions`. Point counts can differ
from `nPoints` due to allocation across cluster regions. Sampling is randomized.
Elevation enrichment of output points currently contacts the USGS elevation
service even when `includeElevation` is false; that option controls clustering
inputs, not output enrichment.

Malformed CSV/options return 400 with an explanatory message. The entire request,
including multipart overhead, is limited to 5 MiB (413 if exceeded). Uploads are
request-local and are not retained; Werkzeug may spool larger files to temporary
disk. For both JSON and multipart requests, polygons must fit within the existing
10-square-mile area limit and a 100000-cell bounding grid at 5-meter spacing.
Long, narrow polygons can hit the grid limit before the area limit. Deployments
below use one synchronous worker to bound concurrent algorithm memory use, with
a 180-second request timeout. These initial resource limits should be calibrated
against the USDA server before production rollout.

## Local Docker Compose deployment

```sh
docker compose up --build -d app
curl --fail http://localhost:5000/
```

The default binding is loopback only. To test across Tailscale on moviebox:

```sh
BIND_ADDRESS=100.113.66.30 PORT=5000 docker compose -p soil-sampling-csv up --build -d app
```

Use `http://moviebox:5000` (or `http://100.113.66.30:5000`) from a connected
Tailscale client. No ngrok service starts by default; it is behind the optional
`ngrok` Compose profile and should only be enabled after configuring its token
and domain. To stop this test deployment, run
`docker compose -p soil-sampling-csv down` in its deployment directory.

### Optional public test tunnel

The ngrok service forwards to `app:5000` inside the Compose network. Its domain
defaults to `sspot.ngrok.dev`; override it with `NGROK_DOMAIN` when needed. Provide
`NGROK_AUTHTOKEN` through the deployment environment using the authorized secrets
wrapper. Do not commit the token or include it in command history or logs.

With the token already supplied to the process environment, enable the profile:

```sh
NGROK_DOMAIN=sspot.ngrok.dev docker compose -p soil-sampling-csv --profile ngrok up -d
curl --fail https://sspot.ngrok.dev/
```

This publishes the API for frontend integration. To disable only the tunnel while
keeping local/Tailscale access, run
`docker compose -p soil-sampling-csv --profile ngrok stop ngrok`.
For local testing, substitute `http://localhost:5000` (with the default loopback binding) or
`http://100.113.66.30:5000` (with the moviebox Tailscale binding) for the public URL in the upload example.

Run focused offline tests with `pytest -q soil_sampling/csv_upload_test.py`.
The older endpoint integration tests also require external USDA/USGS services.

## `POST /mapunits`

Return only the MUKEY map unit polygons, IDs and names for a region.

### Parameters

- `polygon`: A 2-dimensional longitude, latitude polygon array

### Response

Returns a JSON object with the following properties:

- `regions`: A 3-dimensional list of polygons. Each polygon is a 2-dimensional longitude, latitude polygon array representing one regions defined by clustering.
- `region_mukey_ids`: A list of MUKEY IDs. Each MUKEY ID corresponds with the element of `regions` at the same index.

### Example

Request:

```
POST /mapunits
```

Payload:

```json
{
    "polygon": [
        [
            -96.46403155701587,
            41.16309069075756
        ],
        [
            -96.46636300283083,
            41.161335463745964
        ],
        [
            -96.46400983547113,
            41.16123189298148
        ],
        [
            -96.46403155701587,
            41.16309069075756
        ]
    ]
}
```

Response:

```json
{
  "region_mukey_ids": [
    "1691417",
    "2745842",
    "2745842",
    "1691418"
  ],
  "region_mukey_names": [
    "Filbert silt loam, 0 to 1 percent slopes",
    "Tomek silt loam, 0 to 2 percent slopes",
    "Tomek silt loam, 0 to 2 percent slopes",
    "Fillmore silt loam, terrace, occasionally ponded"
  ],
  "regions": [
    [
      [
        -96.46462629742274,
        41.16264294094484
      ],
      [
        -96.464424,
        41.16262
      ],
			
      [
        -96.46462629742274,
        41.16264294094484
      ]
    ]
		
  ]
}
```

## `POST /order-points`

Sort a list of points to create a sampling path.

### Parameters

- `points`: A 2-dimensional longitude, latitude point array

### Response

Returns a JSON object with the following properties:

- `points`: A 2-dimensional list of points sorted in sampling order.

### Example

Request:

```
POST /order-points
```

Payload:

```json
{
    "points": [
        [
            -96.46446016777954,
            41.16152832915371
        ],
        [
            -96.46483892654908,
            41.16153667129834
        ]
    ]
}
```

Response:

```json
{
    "points": [
        [
            -96.4648389252272,
            41.16153670366586
        ],
        [
            -96.4644601664563,
            41.161528361549735
        ]
    ]
}
```

## Errors

This API uses the following error codes:

- `400 Bad Request`: The request was malformed or there was an expected error during processing. The response will contain a message describing the error.
- `404 Not Found`: The requested resource was not found.
- `500 Internal Server Error`: An unexpected error occurred on the server.