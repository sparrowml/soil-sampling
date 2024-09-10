# Soil Sampling API Docs

## Description

Endpoints for running soil sampling algorithms

## Base URL

The base URL for all API requests is:

`https://soil-sampling.ngrok.dev`

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

Soil Map Unit sampling algorithm

### Parameters

- `polygon`: A 2-dimensional longitude, latitude polygon array
- `nPoints` (optional): The number of points to sample. Defaults to `10`.
- `includeElevation` (optional): Whether to include elevation as one of the columns to cluster on. Defaults to `false`.
- `pointDataShapefile` (optional): A URL to a Shapefile archive with point data to include in clustering. (See example Shapefile archive [here](https://sparrowcomputing.s3.amazonaws.com/soil-sampling-test.zip)). Note: either `includeElevation` must be set to `true` or `pointDataShapefile` must be included. It's fine to include both, but a maximum of 3 columns will be used for clustering.

### Response

Returns a JSON object with the following properties:

- `points`: A 2-dimensional longitude, latitude array of points sampled points
- `point_descriptions`: A list of simple point descriptions. Each point description corresponds with the element of `points` at the same index.
- `point_enrichments`: A list of strings with columns stats. Each point enrichments corresponds with the element of `points` at the same index.
- `regions`: A 3-dimensional list of polygons. Each polygon is a 2-dimensional longitude, latitude polygon array representing one regions defined by clustering.
- `region_descriptions`: A list of simple region descriptions. Each region description corresponds with the element of `regions` at the same index.

### Example

Request:

```
POST /clustering
```

Payload:

```json
{
    "polygon": [
        [
            -96.46895154557672,
            41.16833861956085
        ],
        [
            -96.47238993837597,
            41.16323898810186
        ],
        [
            -96.46890535170685,
            41.16207840278774
        ],
        [
            -96.46621271647872,
            41.16301548619598
        ],
        [
            -96.46601492036488,
            41.16586877928358
        ],
        [
            -96.46895154557672,
            41.16833861956085
        ]
    ],
    "nPoints": 4,
    "pointDataShapefile": "https://sparrowcomputing.s3.amazonaws.com/soil-sampling-test.zip",
    "includeElevation": true
}
```

Response:

```json
{
  "point_descriptions": [
    "Cluster: 1",
    "Cluster: 2",
    "Cluster: 3",
    "Cluster: 3"
  ],
  "point_enrichments": [
    "Elevation: 355.94",
    "Elevation: 355.21",
    "Elevation: 355.05",
    "Elevation: 354.98"
  ],
  "points": [
    [
      -96.465673269076,
      41.16154220965342
    ],
    [
      -96.46491540066452,
      41.16159219248645
    ],
    [
      -96.46477164522221,
      41.161866707034086
    ],
    [
      -96.46439288457226,
      41.161858364613735
    ]
  ],
  "region_descriptions": [
    "Cluster: 1",
    "Cluster: 1",
    "Cluster: 2",
    "Cluster: 3"
  ],
  "regions": [
    [
      [
        -96.46538287957983,
        41.16202774348823
      ],
      [
        -96.46538114484183,
        41.16207273925453
      ],
			
      [
        -96.46538287957983,
        41.16202774348823
      ]
    ]
		
  ]
}
```

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