import time

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
    munames_from_mukeys,
    fake_voronoi_sample,
    check_area,
)

app = Flask(__name__)
CORS(app)


@app.route("/")
def hello():
    return "Hello World!"


@app.route("/uniform", methods=["POST"])
def uniform():
    try:
        body = request.get_json()
        polygon = np.array(body.get("polygon"))
        acre = body.get("acre", "1")
        proj = Proj(get_utm_string(polygon[0]))
        utm = np.stack(proj(polygon[:, 0], polygon[:, 1]), -1)
    except:
        return jsonify({"error": "Invalid request. Check your inputs and try again."})
    try:
        check_area(utm)
    except:
        return jsonify(
            {"error": "Invalid polygon. The maximum area is 2 square miles."}
        )
    try:
        grid = uniform_sample(utm, acre)
        grid = np.stack(proj(grid[:, 0], grid[:, 1], inverse=True), -1)
        return jsonify(
            {
                "points": grid.tolist(),
            }
        )
    except:
        return jsonify(
            {
                "error": (
                    "Error running the sampling algorithm. "
                    "You can wait a minute and try again."
                )
            }
        )


@app.route("/voronoi", methods=["POST"])
def voronoi():
    try:
        body = request.get_json()
        polygon = np.array(body.get("polygon"))
        n_points = body.get("nPoints", 10)
        proj = Proj(get_utm_string(polygon[0]))
        utm = np.stack(proj(polygon[:, 0], polygon[:, 1]), -1)
    except Exception as e:
        print(e)
        return (
            jsonify({"error": "Invalid request. Check your inputs and try again."}),
            400,
        )
    try:
        check_area(utm)
    except:
        return (
            jsonify({"error": "Invalid polygon. The maximum area is 2 square miles."}),
            400,
        )
    regions = []
    for _ in range(3):
        try:
            regions, region_mukey_ids = get_mukey_regions(polygon)
            assert len(regions) > 0, "Empty region list"
            break
        except Exception as e:
            time.sleep(1)
            print(e)
    if len(regions) == 0:
        return (
            jsonify(
                {
                    "error": (
                        "Error requesting the MUKEY regions. "
                        "You can wait a minute and try again."
                    )
                }
            ),
            400,
        )
    try:
        shapely_utm = Polygon(utm)
        grid_points = []
        point_mukey_ids = []
        for region, mukey_id in zip(regions, region_mukey_ids):
            utm_region = np.stack(proj(region[:, 0], region[:, 1]), -1)
            shapely_region = Polygon(utm_region)
            n_region_points = round(n_points * shapely_region.area / shapely_utm.area)
            if n_region_points == 0:
                continue
            elif n_region_points < 4:
                points = fake_voronoi_sample(utm_region, n_region_points)
                if points is not None:
                    grid_points.append(points)
                    point_mukey_ids.extend([mukey_id] * len(points))
            else:
                points = voronoi_sample(utm_region, n_region_points)
                grid_points.append(points)
                point_mukey_ids.extend([mukey_id] * len(points))
        grid = np.concatenate(grid_points)
        grid = np.stack(proj(grid[:, 0], grid[:, 1], inverse=True), -1)
        return jsonify(
            {
                "points": grid.tolist(),
                "mukey_ids": point_mukey_ids,
                "regions": [region.tolist() for region in regions],
                "region_mukey_ids": region_mukey_ids,
            }
        )
    except Exception as e:
        print(e)
        return (
            jsonify(
                {
                    "error": (
                        "Error running the sampling algorithm. "
                        "You can wait a minute and try again."
                    )
                }
            ),
            400,
        )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
