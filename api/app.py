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
    fake_voronoi_sample,
    check_area,
    order_points,
    read_file,
    cluster_regions,
    DATA,
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
        triangle_offset = body.get("triangleOffset", True)
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
        grid = order_points(uniform_sample(utm, acre, triangle_offset))
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
        grid = order_points(np.concatenate(grid_points))
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


@app.route("/clustering", methods=["POST"])
def clustering():
    try:
        body = request.get_json()
        polygon = np.array(body.get("polygon"))
        n_points = body.get("nPoints", 10)
        data = read_file(body.get("data", DATA))
        proj = Proj(get_utm_string(polygon[0]))
        data[:, 1:3] = np.stack(proj(data[:, 2], data[:, 1]), -1)
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
    regions, region_descriptions = cluster_regions(utm, data)
    shapely_utm = Polygon(utm)
    grid_points = []
    point_descriptions = []
    lng_lat_regions = []
    for region, description in zip(regions, region_descriptions):
        shapely_region = Polygon(region)
        lng_lat_regions.append(
            np.stack(proj(region[:, 0], region[:, 1], inverse=True), -1)
        )
        # print(np.array(shapely_region.exterior), np.array(shapely_utm.exterior))
        # print(shapely_region.area, shapely_utm.area)
        n_region_points = round(n_points * shapely_region.area / shapely_utm.area)
        if n_region_points == 0:
            continue
        elif n_region_points < 4:
            points = fake_voronoi_sample(region, n_region_points)
            if points is not None:
                grid_points.append(points)
                point_descriptions.extend([description] * len(points))
        else:
            points = voronoi_sample(region, n_region_points)
            grid_points.append(points)
            point_descriptions.extend([description] * len(points))
    grid = order_points(np.concatenate(grid_points))
    grid = np.stack(proj(grid[:, 0], grid[:, 1], inverse=True), -1)
    return jsonify(
        {
            "points": grid.tolist(),
            "point_descriptions": point_descriptions,
            "regions": [region.tolist() for region in lng_lat_regions],
            "region_descriptions": region_descriptions,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
