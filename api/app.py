import json

from flask import Flask, request
from flask_cors import CORS
import numpy as np
from pyproj import Proj
from shapely.geometry import Polygon

from sampling import (
    uniform_grid,
    get_utm_string,
    in_polygon_filter,
    boundary_distance_filter,
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
    proj = Proj(get_utm_string(polygon[0]))
    utm = np.stack(proj(polygon[:, 0], polygon[:, 1]), -1)
    polygon = Polygon(utm)
    grid = uniform_grid(utm)
    grid = in_polygon_filter(grid, polygon)
    grid = boundary_distance_filter(grid, polygon)
    grid = np.stack(proj(grid[:, 0], grid[:, 1], inverse=True), -1)
    return json.dumps(grid.tolist())


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
