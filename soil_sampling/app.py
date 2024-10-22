import time
from typing import Optional

import numpy as np
import pandas as pd
import utm
from flask import Flask, jsonify, request
from flask_cors import CORS
from shapely.geometry import Polygon

from soil_sampling import (DimensionException, check_area, cluster_regions,
                           download_shapefile, enrich_points,
                           fake_voronoi_sample_minmax,
                           fake_voronoi_sample_uniform, get_mukey_region_names,
                           get_mukey_regions, order_points, uniform_sample,
                           voronoi_sample)

app = Flask(__name__)
CORS(app)


@app.route("/")
def hello():
    return jsonify(message="Hello World!")


@app.route("/uniform", methods=["POST"])
def uniform():
    try:
        body = request.get_json()
        polygon = np.array(body.get("polygon"))
        acre = body.get("acre", "1")
        triangle_offset = body.get("triangleOffset", True)
        polygon_x, polygon_y, z_number, z_letter = utm.from_latlon(
            polygon[:, 1], polygon[:, 0]
        )
        utm_polygon = np.stack([polygon_x, polygon_y], -1)
    except:
        return "Invalid request. Check your inputs and try again.", 400    
    try:
        check_area(utm_polygon)
    except:
        return "Invalid polygon. The maximum area is 10 square miles.", 400
    try:
        grid = order_points(uniform_sample(utm_polygon, acre, triangle_offset))
        lat, lon = utm.to_latlon(grid[:, 0], grid[:, 1], z_number, z_letter)
        grid = np.stack([lon, lat], -1)
        return jsonify(
            {
                "points": grid.tolist(),
            }
        )
    except Exception as e:
        print(e)
        return (
            "Error running the sampling algorithm. You can wait a minute and try again."
        ), 400


@app.route("/mapunits", methods=["POST"])
def map_units():
    try:
        body = request.get_json()
        polygon = np.array(body.get("polygon"))
        polygon_x, polygon_y, z_number, z_letter = utm.from_latlon(
            polygon[:, 1], polygon[:, 0]
        )
        utm_polygon = np.stack([polygon_x, polygon_y], -1)
    except Exception as e:
        print(e)
        return ("Invalid request. Check your inputs and try again.", 400)
    try:
        check_area(utm_polygon)
    except:
        return (
            "Invalid polygon. The maximum area is 10 square miles.",
            400,
        )
    regions = []
    for _ in range(3):
        try:
            regions, region_mukey_ids = get_mukey_regions(polygon)
            region_names = get_mukey_region_names(region_mukey_ids)
            assert len(regions) > 0, "Empty region list"
            break
        except Exception as e:
            time.sleep(1)
            print(e)
    if len(regions) == 0:
        return (
            "Error requesting the MUKEY regions. You can wait a minute and try again.",
            400,
        )
    return jsonify(
        {
            "regions": [region.tolist() for region in regions],
            "region_mukey_ids": region_mukey_ids,
            "region_mukey_names": region_names,
        }
    )


@app.route("/voronoi", methods=["POST"])
def voronoi():
    try:
        body = request.get_json()
        polygon = np.array(body.get("polygon"))
        n_points = body.get("nPoints", 10)
        polygon_x, polygon_y, z_number, z_letter = utm.from_latlon(
            polygon[:, 1], polygon[:, 0]
        )
        utm_polygon = np.stack([polygon_x, polygon_y], -1)
    except Exception as e:
        print(e)
        return ("Invalid request. Check your inputs and try again.", 400)
    if n_points > 200:
        return (
            "The maximum number of points is 200. Please reduce the number of points and try again.",
            400,
        )
    try:
        check_area(utm_polygon)
    except:
        return ("Invalid polygon. The maximum area is 10 square miles.", 400)
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
            "Error requesting the MUKEY regions. You can wait a minute and try again.",
            400,
        )
    try:
        shapely_utm = Polygon(utm_polygon)
        grid_points = []
        point_mukey_ids = []
        all_voronoi_regions: list[Polygon] = []
        for region, mukey_id in zip(regions, region_mukey_ids):
            x, y, _, __ = utm.from_latlon(
                region[:, 1], region[:, 0], z_number, z_letter
            )
            utm_region = np.stack([x, y], -1)
            shapely_region = Polygon(utm_region)
            n_region_points = round(n_points * shapely_region.area / shapely_utm.area)
            if n_region_points == 0:
                continue
            elif n_region_points < 4:
                points = fake_voronoi_sample_uniform(utm_region, n_region_points)
                if points is not None:
                    grid_points.append(points)
                    point_mukey_ids.extend([mukey_id] * len(points))
            else:
                points, voronoi_regions = voronoi_sample(utm_region, n_region_points)
                grid_points.append(points)
                point_mukey_ids.extend([mukey_id] * len(points))
                all_voronoi_regions += voronoi_regions
        grid = order_points(np.concatenate(grid_points))
        lat, lon = utm.to_latlon(grid[:, 0], grid[:, 1], z_number, z_letter)
        grid = np.stack([lon, lat], -1)
        updated_voronoi_regions = []
        for region in all_voronoi_regions:
            lat, lon = utm.to_latlon(region[:, 0], region[:, 1], z_number, z_letter)
            updated_voronoi_regions.append(np.stack([lon, lat], -1).tolist())
        return jsonify(
            {
                "points": grid.tolist(),
                "mukey_ids": point_mukey_ids,
                "regions": [region.tolist() for region in regions],
                "region_mukey_ids": region_mukey_ids,
                # "voronoi_regions": updated_voronoi_regions,
            }
        )
    except Exception as e:
        print(e)
        return (
            "Error running the sampling algorithm. You can wait a minute and try again.",
            400,
        )


@app.route("/cema221", methods=["POST"])
def cema221():
    try:
        body = request.get_json()
        polygon = np.array(body.get("polygon"))
        n_points = body.get("nPoints", 6)
        polygon_x, polygon_y, z_number, z_letter = utm.from_latlon(
            polygon[:, 1], polygon[:, 0]
        )
        utm_polygon = np.stack([polygon_x, polygon_y], -1)
    except Exception as e:
        print(e)
        return (
            "Invalid request. Check your inputs and try again.",
            400,
        )
    if n_points > 200:
        return (
            "The maximum number of points is 200. Please reduce the number of points and try again.",
            400,
        )        
    try:
        check_area(utm_polygon)
    except:
        return (
            "Invalid polygon. The maximum area is 10 square miles.",
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
    region_map = {}
    for mukey_id, region in zip(region_mukey_ids, regions):
        if mukey_id not in region_map:
            region_map[mukey_id] = region
        elif Polygon(region_map[mukey_id]).area < Polygon(region).area:
            region_map[mukey_id] = region
    regions = []
    region_mukey_ids = []
    for mukey_id, region in region_map.items():
        regions.append(region)
        region_mukey_ids.append(mukey_id)
    if len(regions) == 0:
        return (
            "Error requesting the MUKEY regions. You can wait a minute and try again.",
            400,
        )
    try:
        grid_points = []
        point_mukey_ids = []
        all_voronoi_regions: list[Polygon] = []
        for region, mukey_id in zip(regions, region_mukey_ids):
            x, y, _, __ = utm.from_latlon(
                region[:, 1], region[:, 0], z_number, z_letter
            )
            utm_region = np.stack([x, y], -1)
            n_region_points = round(n_points / len(regions))
            points = fake_voronoi_sample_minmax(utm_region, n_region_points)
            if points is not None:
                grid_points.append(points)
                point_mukey_ids.extend([mukey_id] * len(points))
        grid = order_points(np.concatenate(grid_points))
        lat, lon = utm.to_latlon(grid[:, 0], grid[:, 1], z_number, z_letter)
        grid = np.stack([lon, lat], -1)
        updated_voronoi_regions = []
        for region in all_voronoi_regions:
            lat, lon = utm.to_latlon(region[:, 0], region[:, 1], z_number, z_letter)
            updated_voronoi_regions.append(np.stack([lon, lat], -1).tolist())
        return jsonify(
            {
                "points": grid.tolist(),
                "mukey_ids": point_mukey_ids,
                "regions": [region.tolist() for region in regions],
                "region_mukey_ids": region_mukey_ids,
                # "voronoi_regions": updated_voronoi_regions,
            }
        )
    except Exception as e:
        print(e)
        return (
            "Error running the sampling algorithm. You can wait a minute and try again.",
            400,
        )


@app.route("/clustering", methods=["POST"])
def clustering():
    try:
        body = request.get_json()
        polygon = np.array(body.get("polygon"))
        n_points = body.get("nPoints", 10)
        polygon_x, polygon_y, z_number, z_letter = utm.from_latlon(
            polygon[:, 1], polygon[:, 0]
        )
        utm_polygon = np.stack([polygon_x, polygon_y], -1)
        include_elevation = body.get("includeElevation", False)
        point_data: Optional[pd.DataFrame] = None
        if "pointDataShapefile" in body:
            point_data = download_shapefile(body["pointDataShapefile"])
        if not include_elevation and point_data is None:
            return "You must include elevation or provide point data.", 400
    except Exception as e:
        print(e)
        return "Invalid request. Check your inputs and try again.", 400
    if n_points > 200:
        return (
            "The maximum number of points is 200. Please reduce the number of points and try again.",
            400,
        )        
    try:
        check_area(utm_polygon)
    except:
        return "Invalid polygon. The maximum area is 10 square miles.", 400
    try:
        try:
            utm_regions, region_descriptions = cluster_regions(
                utm_polygon, z_number, z_letter, include_elevation, point_data
            )
        except DimensionException:
            return (
                "Too many dimensions for clustering. A maximum of 3 (including elevation) is supported.",
                400,
            )
        shapely_utm = Polygon(utm_polygon)
        all_utm_sample_points = []
        point_descriptions = []
        lng_lat_regions = []
        all_voronoi_regions = []
        for utm_region, description in zip(utm_regions, region_descriptions):
            lat, lon = utm.to_latlon(
                utm_region[:, 0], utm_region[:, 1], z_number, z_letter
            )
            shapely_utm_region = Polygon(utm_region)
            lng_lat_regions.append(np.stack([lon, lat], -1))
            n_region_points = round(
                n_points * shapely_utm_region.area / shapely_utm.area
            )
            if n_region_points == 0:
                continue
            elif n_region_points < 4:
                # TODO: return a warning message
                # Warning: one of the sampling sub-regions is too small for the number of points you picked
                # Indicate what percentage of the area is in this sub-region
                # If 50% or more of total area is in a failed sub-region, throw an error
                utm_sample_points = fake_voronoi_sample_uniform(
                    utm_region, n_region_points
                )
                if utm_sample_points is not None:
                    all_utm_sample_points.append(utm_sample_points)
                    point_descriptions.extend([description] * len(utm_sample_points))
            else:
                utm_sample_points, voronoi_regions = voronoi_sample(
                    utm_region, n_region_points
                )
                all_utm_sample_points.append(utm_sample_points)
                point_descriptions.extend([description] * len(utm_sample_points))
                all_voronoi_regions += voronoi_regions
        utm_sample_points = order_points(np.concatenate(all_utm_sample_points))
        point_enrichments = enrich_points(utm_sample_points, z_number, z_letter)
        lat, lon = utm.to_latlon(
            utm_sample_points[:, 0], utm_sample_points[:, 1], z_number, z_letter
        )
        sample_points = np.stack([lon, lat], -1)
        updated_voronoi_regions = []
        for region in all_voronoi_regions:
            lat, lon = utm.to_latlon(region[:, 0], region[:, 1], z_number, z_letter)
            updated_voronoi_regions.append(np.stack([lon, lat], -1).tolist())
        return jsonify(
            {
                "points": sample_points.tolist(),
                "point_enrichments": point_enrichments,
                "point_descriptions": point_descriptions,
                "regions": [region.tolist() for region in lng_lat_regions],
                "region_descriptions": region_descriptions,
                # "voronoi_regions": updated_voronoi_regions,
            }
        )
    except Exception as e:
        print(e)
        return (
            "Error running the clustering algorithm. "
            "You can wait a minute and try again."
        ), 400


@app.route("/order-points", methods=["POST"])
def order_points_route():
    try:
        body = request.get_json()
        points = np.array(body.get("points"))
        points_x, points_y, z_number, z_letter = utm.from_latlon(
            points[:, 1], points[:, 0]
        )
        utm_points = np.stack([points_x, points_y], -1)
    except Exception as e:
        print(e)
        return "Invalid request. Check your inputs and try again.", 400
    try:
        ordered_utm_points = order_points(utm_points)
        lat, lon = utm.to_latlon(
            ordered_utm_points[:, 0], ordered_utm_points[:, 1], z_number, z_letter
        )
        ordered_points = np.stack([lon, lat], -1)
        return jsonify({"points": ordered_points.tolist()})
    except Exception as e:
        print(e)
        return "Error ordering the points. You can wait a minute and try again.", 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
