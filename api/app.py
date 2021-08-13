import json

from flask import Flask, request
from flask_cors import CORS
import numpy as np
from pyproj import Proj

from sampling import uniform_sample, get_utm_string, voronoi_sample

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
    return json.dumps(grid.tolist())


@app.route("/voronoi", methods=["POST"])
def voronoi():
    body = request.get_json()
    polygon = np.array(body.get("polygon"))
    n_points = body.get("nPoints", 10)
    print(type(n_points), n_points)
    proj = Proj(get_utm_string(polygon[0]))
    utm = np.stack(proj(polygon[:, 0], polygon[:, 1]), -1)
    grid = voronoi_sample(utm, n_points)
    grid = np.stack(proj(grid[:, 0], grid[:, 1], inverse=True), -1)
    return json.dumps(grid.tolist())


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
