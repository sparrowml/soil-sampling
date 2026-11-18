# Soil Sampling API Docs

## Acknowledgments

SSPOT was originally developed by **Dr. Trenton Franz** at the **University of Nebraska–Lincoln**, who developed the scientific methodology and sampling algorithms, and **Ben Cook**, who collaborated on the original software implementation. SSPOT was subsequently expanded through collaboration with the **USDA Agricultural Research Service (ARS)** and its **Partnership for Data Innovations (PDI)**.

SSPOT is freely available at [https://sspot.scinet.usda.gov](https://sspot.scinet.usda.gov), and its open-source code is available under the MIT License at [GitHub – sparrowml/soil-sampling](https://github.com/sparrowml/soil-sampling).

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
latitude -80 to 84, longitude -180 to 180). Coordinate aliases `latitude`, `long`,
and `longitude` are accepted case-insensitively. Completely empty columns are
ignored. Empty rows and rows with missing/`NaN` measurements are skipped; the
response reports original, retained, empty, incomplete and duplicate row counts.
Other values must be finite numbers; duplicate headers and extra text columns
are rejected. Identical observations at one coordinate are collapsed; conflicting
measurements at the same coordinate require correction, rather than arbitrary
nearest-neighbor selection or an undocumented averaging policy.
Whitespace around headers and values is allowed. Include at
least three rows, three distinct locations and three distinct measurement value
combinations. At most 10000 rows and 1000 columns (including empty columns) are accepted. These are synthetic example
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
  `polygonGeoJson` may replace `polygon` to supply a WGS84 Polygon/MultiPolygon
  geometry (or Feature) preserving holes and detached pieces.
  Optional `clusteringOptions` staging settings are described below.
- Instead of `options`, individual form fields `polygon`, `nPoints`, and
  `includeElevation` are accepted; each value must be JSON encoded. Do not mix
  the two option styles.

`polygon` is an array of longitude/latitude pairs forming a valid polygon.
Including elevation uses one of the maximum three clustering dimensions. CSV and
shapefile input cannot be combined in one request. The server does not fetch CSV
URLs: download the sample, then upload it directly.

When an uploaded `Elev` or `elevation` column is present (case-insensitive), it
takes precedence over `includeElevation:true`: all uploaded measurements are
retained and fetched elevation is not added again. This decision is reported in
`diagnostics.input.elevation` and `diagnostics.warnings`. Other names are not
guessed to mean elevation, except explicit `relative`/`absolute` modifiers before
or after those two names (spaces, underscores and hyphens are equivalent), such
as `Elev Relative`. This uses the uploaded relative measurement as requested;
it does not convert relative values to absolute altitude. Three other measurement columns plus requested
automatic elevation still produce an actionable dimension-limit error.

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

The existing response fields remain: `points`, `point_descriptions`,
`point_enrichments`, `regions`, and `region_descriptions`. Successful responses
contain exactly `nPoints` distinct, deterministic locations inside their assigned
connected zone. Bounded area allocation and constrained Lloyd refinement support
1–200 samples; unusually narrow/complex geometry returns a clear error if the
processing limit prevents safe placement. Some components remain unsampled when
the budget is small. Their area is reported, not treated as adequately sampled.
Additive `point_component_ids`, `regions_geojson` and `diagnostics` fields provide
component identity, hole-preserving polygons, cleanup settings and input warnings.
Elevation enrichment of output points currently contacts the USGS elevation
service even when `includeElevation` is false; that option controls clustering
inputs, not output enrichment. If output enrichment fails, valid samples are
returned with an explicit elevation-unavailable warning instead of discarding
the sampling result.

Malformed CSV/options return 400 with an explanatory message. The entire request,
including multipart overhead, is limited to 5 MiB (413 if exceeded). Uploads are
request-local and are not retained; Werkzeug may spool larger files to temporary
disk. For both JSON and multipart requests, polygons must fit within the existing
10-square-mile area limit and a 100000-cell bounding grid at 5-meter spacing.
Long, narrow polygons can hit the grid limit before the area limit. Requests have
a 180-second timeout. These initial resource limits should be calibrated against
the USDA server before production rollout.

Clustering uses a 5-meter grid. Region boundaries partition the entire AOI,
including small disconnected pieces, with nearest-neighbor filling at that grid
resolution and clipping to the AOI. Regions with holes are returned as multiple
hole-free polygons with the same cluster description, preserving the existing
response format. Sum all polygons for a cluster when calculating its acreage.
The 10,000-row limit counts input rows, including ignored rows. At least three
usable rows with distinct locations and clustering value combinations must remain.
Missing `lat`/`lon` headers and invalid coordinates return actionable 400 messages;
coordinates must be decimal degrees, not projected eastings/northings.

### Staging spatial cleanup (PR preview only)

The test endpoint uses nearest-neighbor measurements on a 5 m grid, a local
3×3 median constrained to neighbors within the AOI, standardized measurements,
and deterministic k-means with a fixed maximum of three classes. No automatic
2–5-class research CLI is deployed. Constant measurements within the AOI return
an explanatory error; two distinct combinations can produce two classes.

Small connected patches are merged only into a truly adjacent class using
shared-boundary contact and standardized measurement similarity. The default
minimum is **5000 m² (0.5 ha), capped at 1% of the AOI area** so small AOIs are
not erased by the fixed threshold. Large disconnected regions are retained;
cleanup and smoothing do not join across excluded AOI holes/gaps. Grid-edge
extrapolation is clipped to the exact AOI, including sub-grid detached pieces.

Optional `clusteringOptions` accepts `smoothingCells` of 1, 3 (default), or 5,
and `minPatchAreaM2` between 0 and 10000 (default 5000; the 1% cap still applies).
Use 1 and 0 for a standardized, unsmoothed control. Diagnostics include raw/clean
grid component counts, final polygon and legacy-ring counts, cleanup-reassigned
cells, projected coverage/overlap areas, samples and build revision. Reassignment
counts describe patch cleanup after smoothing/classification, not all differences
from the previous unscaled algorithm. Coordinate serialization has finite
projection precision; coverage tolerances are evaluated in projected meters.

These are staging defaults for visual/scientific review, **not calibrated
agronomic thresholds**. Independent synthetic tests exercise holes, gaps,
concavity, noisy patches, units, missing values and small/large sample budgets.
Private field validation must remain outside this public repository.

Legacy rings preserve area by splitting polygons with holes and may still show
internal straight outlines if drawn independently. Render `regions_geojson` (or
dissolve same-class polygons) to eliminate those artificial outlines. Clients
must also send every AOI ring via `polygonGeoJson`; a frontend that submits only
its first exterior ring cannot convey holes to the server. `GET /version`
identifies the deployed revision; the root health response is unchanged.

### Esri frontend integration

This is the handoff for the preview renderer. Use the test API at
`https://sspot.ngrok.dev`; check `GET /version` for the deployed runtime SHA.
Documentation commits on this PR may be newer than that runtime. The request and
response additions below are available in runtime
`9bf6b118d633829f0d61bc41aee302330d89a1a4`.

#### Send the complete area, including holes

Send **either** `polygonGeoJson` **or** legacy `polygon`, never both. Prefer
`polygonGeoJson` for new frontend work:

- Coordinates are WGS84 **`[longitude, latitude]`**, not map-screen coordinates,
  latitude/longitude order, or Web Mercator meters. Project the map geometry to
  WGS84 before exporting it.
- A GeoJSON `Polygon.coordinates` contains `[exteriorRing, holeRing, ...]`.
  A `MultiPolygon.coordinates` contains one such ring group per separate polygon.
  Close each ring by repeating its first coordinate at the end.
- Preserve the association between each exterior and its holes. Do not use
  `drawnPolygon.rings[0]`, flatten all rings into one path, concatenate separate
  parts, or assume every ArcGIS ring after the first is a hole. Use a tested
  GeoJSON conversion that groups the rings correctly and handles winding; ArcGIS
  exterior/interior winding conventions differ from GeoJSON. See Esri's
  [geometry reference](https://developers.arcgis.com/rest/services-reference/enterprise/geometry-objects/).
- Keep detached areas as separate Polygon features/parts in the UI and combine
  them into a correctly nested `MultiPolygon` for this API. Do not connect them
  with invented line segments. The API accepts a geometry or a single Feature,
  **not** an AOI FeatureCollection.

Here is a small synthetic CSV, including one incomplete row to exercise warnings:

```csv
lon,lat,ECD,Elev
-96.46995,41.16305,10,300
-96.46985,41.16305,20,301
-96.46975,41.16325,30,302
-96.46995,41.16325,,303
```

Use these JSON options in the existing multipart `options` field alongside the
file in `pointDataCsv`. The second ring is an excluded hole:

```json
{
  "polygonGeoJson": {
    "type": "Polygon",
    "coordinates": [
      [[-96.4700,41.1630],[-96.4697,41.1630],[-96.4697,41.1633],[-96.4700,41.1633],[-96.4700,41.1630]],
      [[-96.4699,41.1631],[-96.4699,41.1632],[-96.4698,41.1632],[-96.4698,41.1631],[-96.4699,41.1631]]
    ]
  },
  "nPoints": 1,
  "includeElevation": true
}
```

```js
const form = new FormData();
form.append("options", JSON.stringify(options));
form.append("pointDataCsv", csvFile); // File containing the synthetic CSV above
const response = await fetch("https://sspot.ngrok.dev/clustering", {
  method: "POST", body: form
}); // Let the browser set the multipart Content-Type and boundary.
if (!response.ok) throw new Error(await response.text());
const result = await response.json();
```

#### Render the hole-aware response once

Use `result.regions_geojson`, a GeoJSON FeatureCollection, as the polygon source.
Keep each feature's complete geometry, including all interior rings and any
separate parts. **Do not also draw `regions`/`region_descriptions`** for that
response: those legacy hole-free pieces can reintroduce internal split outlines.
Clear the previous result layer when replacing a result so old polygons do not
remain underneath the new ones. Do not draw the region coordinate arrays as a
single polyline; that creates false connector lines.

Feature properties are exactly:

| Property | Use |
| --- | --- |
| `description` | Class label such as `Cluster: 3`; use this for color/legend grouping. |
| `component_id` | Integer identifying a connected component within this response; use for point-to-zone lookup, not class colors. |
| `area_m2` | Component area in projected square meters. Sum by `description` for class acreage. |
| `sample_count` | Number of returned sample points assigned to this component. Zero is valid. |

There is **no `cluster` property** in this API. Separate components with the same
`description` should have the same styling. IDs and class numbers are not durable
identifiers across changed inputs or new requests.

This excerpt comes from the synthetic request above. It shows only the sampled
component; other features, legacy fields and some diagnostics are omitted for
brevity. Render the **entire** FeatureCollection from the actual response:

```json
{
  "points": [[-96.46982614925115,41.163230757326126]],
  "point_descriptions": ["Cluster: 3"],
  "point_component_ids": [4],
  "regions_geojson": {
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "properties": {
        "description": "Cluster: 3",
        "component_id": 4,
        "area_m2": 341.456540533637,
        "sample_count": 1
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-96.46994506676108,41.16317892911611],
          [-96.46994333507341,41.163223925032085],
          [-96.46999999870295,41.163225170436654],
          [-96.46999999869648,41.16330000054751],
          [-96.4696999986954,41.16330000054748],
          [-96.46969999870386,41.16312850849551],
          [-96.4697999986966,41.16313070657778],
          [-96.46979999869578,41.16320000054749],
          [-96.46989999869614,41.163200000547505],
          [-96.4698999986968,41.16317793855032],
          [-96.46994506676108,41.16317892911611]
        ]]
      }
    }]
  },
  "diagnostics": {
    "input": {
      "rows_read": 4, "rows_retained": 3, "rows_empty": 0,
      "rows_incomplete": 1, "rows_duplicate": 0,
      "ignored_empty_column_count": 0,
      "elevation": {
        "requested_automatic": true,
        "used_automatic": false,
        "uploaded_columns": ["Elev"]
      }
    }
  }
}
```

For ArcGIS Maps SDK for JavaScript, the documented
[GeoJSONLayer](https://developers.arcgis.com/javascript/latest/references/core/layers/GeoJSONLayer/)
supports Polygon/MultiPolygon data and an in-memory Blob URL. Use a
[UniqueValueRenderer](https://developers.arcgis.com/javascript/latest/references/core/renderers/UniqueValueRenderer/)
on `description`. With `GeoJSONLayer` imported using the app's existing SDK
loading mechanism:

```js
const descriptions = [...new Set(result.regions_geojson.features
  .map(feature => feature.properties.description))];
const palette = ["#f1a340", "#998ec3", "#77bda5"];
const blobUrl = URL.createObjectURL(new Blob(
  [JSON.stringify(result.regions_geojson)], { type: "application/json" }
));
const layer = new GeoJSONLayer({
  url: blobUrl,
  renderer: {
    type: "unique-value", field: "description",
    uniqueValueInfos: descriptions.map((value, index) => ({
      value,
      symbol: { type: "simple-fill", color: palette[index % palette.length],
        outline: { color: "#333333", width: 0.5 } }
    }))
  }
});
await layer.load();
map.add(layer);
// Keep blobUrl while the layer is in use. When replacing/removing this result:
// map.remove(layer); layer.destroy(); URL.revokeObjectURL(blobUrl);
```

`points[i]`, `point_descriptions[i]`, `point_enrichments[i]`, and
`point_component_ids[i]` describe the same sample. Match
`point_component_ids[i]` to `feature.properties.component_id`; do not use it as a
zero-based feature index or regroup just one of the aligned arrays. Render point
markers in a separate point layer, preserving their supplied longitude/latitude.

#### Show input decisions and verify the handoff

Show `diagnostics.warnings` to users after a successful upload, including skipped
rows and unavailable output elevation enrichment. CSV-specific counts use these
paths:

| Path | Meaning |
| --- | --- |
| `diagnostics.input.rows_read` | Input data rows, including rows later skipped. |
| `diagnostics.input.rows_retained` | Usable observations retained after cleaning. |
| `diagnostics.input.rows_empty` | Entirely empty rows skipped. |
| `diagnostics.input.rows_incomplete` | Rows skipped for missing/NaN values. |
| `diagnostics.input.rows_duplicate` | Identical duplicate observations collapsed. |
| `diagnostics.input.ignored_empty_column_count` | Entirely empty columns ignored. |

`diagnostics.input.warnings` contains the input subset; do not display duplicate
messages from both warning arrays. These CSV counts may be absent for legacy
non-CSV requests. Also surface the server's text error for non-200 responses.

Prefer an explicit automatic-elevation control rather than hardcoding `true`.
Uploaded `Elev`/`elevation` (including the documented relative/absolute aliases)
remains selected when automatic elevation is requested: the server keeps **all**
CSV measurements and omits the duplicate fetched clustering dimension. Display
`diagnostics.input.elevation.requested_automatic`,
`diagnostics.input.elevation.used_automatic`, and
`diagnostics.input.elevation.uploaded_columns` when explaining that decision. Do not label uploaded relative
elevation as absolute altitude. Three unrelated measures plus automatic elevation
still exceed the three-measurement limit. Output point enrichment is a separate
operation, not a fourth clustering measurement.

Before considering the Esri integration complete, check these cases in the actual
map, not just the API response:

1. **Donut AOI:** send both rings, retain the empty center in output and selection,
   and place no sample inside the excluded hole. Respect the documented finite
   reprojection precision; do not demand exact equality of geographic vertices.
2. **Detached AOI:** send a MultiPolygon, show both pieces without a connecting
   line, and preserve each piece's own holes. Small sample budgets need not sample
   every component.
3. **Same-class pieces:** equal `description` values get equal colors. Render the
   GeoJSON layer once; no artificial horizontal outlines from legacy split rings
   should remain. Real class boundaries and separate component outlines remain.
4. **Point alignment:** returned count equals requested count; every marker's
   component lookup and description agree, including when a component ID is not
   the feature's array position. No coordinates from different rings are joined.
5. **CSV feedback:** the synthetic example reports 4 read / 3 retained / 1
   incomplete row, preserves uploaded elevation, and displays the warning once.
   An invalid upload displays the backend error instead of a generic empty map.
6. **Replacement:** running again removes/destroys the previous result layer and
   releases its Blob URL. Confirm there is no duplicate legacy overlay.

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
