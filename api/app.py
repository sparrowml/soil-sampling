import json

from flask import Flask, request
import numpy as np
from pyproj import Proj

from sampling import bounding_box

app = Flask(__name__)

proj = Proj("+proj=utm +ellps=WGS84 +datum=WGS84 +units=m +no_defs")


@app.route("/")
def hello():
    return "Hello World!"


@app.route("/uniform")
def uniform():
    polygon = np.array(json.loads(request.args.get("polygon")))
    utm = np.stack(proj(polygon[:, 0], polygon[:, 1]), -1)
    bbox = bounding_box(utm)
    return json.dumps(bbox.tolist())


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
