import json

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from pyproj import Proj
from shapely.geometry.polygon import Polygon

from sampling import (
    uniform_sample,
    get_utm_string,
    voronoi_sample,
    get_mukey_regions,
    fake_voronoi_sample,
)

app = Flask(__name__)
CORS(app)


@app.route("/")
def hello():
    return "Hello World!"


@app.route("/uniform", methods=["POST"])
def uniform():
    body = request.get_json()
    polygon = np.array(body.get("polygon"))
    acre = body.get("acre", "1")
    proj = Proj(get_utm_string(polygon[0]))
    utm = np.stack(proj(polygon[:, 0], polygon[:, 1]), -1)
    grid = uniform_sample(utm, acre)
    grid = np.stack(proj(grid[:, 0], grid[:, 1], inverse=True), -1)
    return jsonify(
        {
            "points": grid.tolist(),
        }
    )


@app.route("/voronoi", methods=["POST"])
def voronoi():
    body = request.get_json()
    polygon = np.array(body.get("polygon"))
    n_points = body.get("nPoints", 10)
    regions = get_mukey_regions(polygon)
    proj = Proj(get_utm_string(polygon[0]))
    utm = np.stack(proj(polygon[:, 0], polygon[:, 1]), -1)
    shapely_utm = Polygon(utm)
    grid_points = []
    for region in regions:
        utm_region = np.stack(proj(region[:, 0], region[:, 1]), -1)
        shapely_region = Polygon(utm_region)
        n_region_points = round(n_points * shapely_region.area / shapely_utm.area)
        if n_region_points == 0:
            continue
        elif n_region_points < 4:
            points = fake_voronoi_sample(utm_region, n_region_points)
            if points is not None:
                grid_points.append(points)
        else:
            grid_points.append(voronoi_sample(utm_region, n_region_points))
    grid = np.concatenate(grid_points)
    grid = np.stack(proj(grid[:, 0], grid[:, 1], inverse=True), -1)
    return jsonify(
        {
            "points": grid.tolist(),
            "regions": [region.tolist() for region in regions],
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
