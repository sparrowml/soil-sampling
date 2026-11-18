import time
import os
from typing import Optional

import numpy as np
import pandas as pd
import utm
from flask import Flask, jsonify, request
from werkzeug.exceptions import RequestEntityTooLarge
from soil_sampling.clustering import exterior_parts, polygon_parts
from soil_sampling.csv_upload import clustering_input, resolve_elevation, MAX_UPLOAD_BYTES, MAX_GRID_CELLS
from flask_cors import CORS
from shapely.geometry import Point, Polygon, shape as geometry_shape, mapping
from shapely.ops import transform
from soil_sampling.zones import cluster_zones, sample_zones

from soil_sampling import (DimensionException, check_area, cluster_regions,
                           download_shapefile, enrich_points,
                           fake_voronoi_sample_minmax,
                           fake_voronoi_sample_uniform, get_mukey_region_names,
                           get_mukey_regions, order_points, uniform_sample,
                           voronoi_sample)

app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_BYTES


@app.errorhandler(RequestEntityTooLarge)
def upload_too_large(error):
    return "Request exceeds the 5 MiB limit.", 413


@app.route("/")
def hello():
    return jsonify(message="Hello World!")


@app.route('/version')
def version():
    return jsonify(revision=os.environ.get('APP_REVISION', 'development'),
                   clustering_algorithm='fixed-three-standardized-spatial-v1')


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


def clustering_polygon(body):
    if 'polygonGeoJson' in body:
        if 'polygon' in body:
            raise ValueError('Supply polygon or polygonGeoJson, not both.')
        source = body['polygonGeoJson']
        if not isinstance(source, dict):
            raise ValueError('polygonGeoJson must be a Polygon or MultiPolygon geometry.')
        if source.get('type') == 'Feature':
            source = source.get('geometry')
        geometry = geometry_shape(source)
    else:
        coordinates = np.asarray(body.get('polygon'), dtype=float)
        if coordinates.ndim != 2 or coordinates.shape[1] != 2 or not 3 <= len(coordinates) <= 10000:
            raise ValueError('polygon must contain 3 to 10000 finite longitude/latitude pairs.')
        geometry = Polygon(coordinates)
    if geometry.geom_type not in ('Polygon', 'MultiPolygon') or geometry.is_empty or not geometry.is_valid:
        raise ValueError('Area must be a valid nonempty Polygon or MultiPolygon without self-intersections.')
    coordinates = np.concatenate([np.asarray(ring.coords) for part in polygon_parts(geometry)
                                  for ring in [part.exterior, *part.interiors]])
    if len(coordinates) > 10000 or coordinates.shape[1] != 2 or not np.isfinite(coordinates).all():
        raise ValueError('Area must contain at most 10000 finite longitude/latitude pairs.')
    if not ((coordinates[:, 0] >= -180) & (coordinates[:, 0] <= 180)).all() or not ((coordinates[:, 1] >= -80) & (coordinates[:, 1] <= 84)).all():
        raise ValueError('Area coordinates must use WGS84 longitude/latitude within supported UTM bounds.')
    _, _, zone, letter = utm.from_latlon(coordinates[0, 1], coordinates[0, 0])
    def to_xy(lon, lat, z=None):
        x, y, _, __ = utm.from_latlon(np.asarray(lat), np.asarray(lon), zone, letter)
        return x, y
    field = transform(to_xy, geometry)
    if not field.is_valid or field.area <= 0 or field.area > 2.59e7:
        raise ValueError('Invalid polygon. The maximum area is 10 square miles.')
    xmin, ymin, xmax, ymax = field.bounds
    if np.prod(np.ceil(np.array([xmax-xmin, ymax-ymin]) / 5)) > MAX_GRID_CELLS:
        raise ValueError('Polygon bounding box exceeds the 100000 cell clustering grid limit; reduce its extent.')
    return field, zone, letter


@app.route("/clustering", methods=["POST"])
def clustering():
    try:
        body, point_data = clustering_input(request)
        field, z_number, z_letter = clustering_polygon(body)
        n_points = body.get('nPoints', 10)
        if 'pointDataShapefile' in body:
            point_data = download_shapefile(body['pointDataShapefile'])
            resolve_elevation(body, point_data)
        include_elevation = body.get('includeElevation', False)
        if not include_elevation and point_data is None:
            raise ValueError('You must include elevation or provide point data.')
        input_diagnostics = point_data.attrs.get('input_diagnostics', {}) if point_data is not None else {}
        zones, descriptions, diagnostics = cluster_zones(field, z_number, z_letter,
            include_elevation, point_data, body.get('clusteringOptions'))
        points, point_descriptions, component_ids, allocations = sample_zones(zones, descriptions, n_points)
        ordered = order_points(points)
        indices = [int(np.argmin(np.linalg.norm(points - point, axis=1))) for point in ordered]
        point_descriptions = [point_descriptions[i] for i in indices]
        component_ids = [component_ids[i] for i in indices]
        warnings = list(input_diagnostics.get('warnings', []))
        try:
            point_enrichments = enrich_points(ordered, z_number, z_letter)
        except Exception:
            point_enrichments = ['Elevation unavailable'] * len(ordered)
            warnings.append('Sample locations were generated, but elevation enrichment is temporarily unavailable.')
        def to_ll(x, y, z=None):
            lat, lon = utm.to_latlon(np.asarray(x), np.asarray(y), z_number, z_letter)
            return lon, lat
        regions, region_descriptions, features = [], [], []
        for component, (polygon, description) in enumerate(zip(zones, descriptions), 1):
            geographic = transform(to_ll, polygon)
            features.append({'type': 'Feature', 'properties': {'component_id': component,
                'description': description, 'area_m2': polygon.area, 'sample_count': int(allocations[component-1])},
                'geometry': mapping(geographic)})
            for part in exterior_parts(polygon):
                regions.append(list(transform(to_ll, part).exterior.coords))
                region_descriptions.append(description)
        diagnostics.update({'input': input_diagnostics, 'warnings': warnings,
            'samples_requested': n_points, 'samples_returned': len(ordered),
            'components_sampled': int(np.count_nonzero(allocations)),
            'represented_component_area_fraction': sum(p.area for p,n in zip(zones,allocations) if n) / field.area,
            'release': os.environ.get('APP_REVISION', 'development')})
        lon, lat = to_ll(ordered[:, 0], ordered[:, 1])
        return jsonify({'points': np.column_stack([lon, lat]).tolist(),
            'point_enrichments': point_enrichments, 'point_descriptions': point_descriptions,
            'point_component_ids': component_ids, 'regions': regions, 'region_descriptions': region_descriptions,
            'regions_geojson': {'type': 'FeatureCollection', 'features': features}, 'diagnostics': diagnostics})
    except RequestEntityTooLarge:
        raise
    except (ValueError, TypeError, IndexError, KeyError) as error:
        return str(error), 400
    except Exception as error:
        app.logger.exception('Clustering failed')
        return 'Error running the clustering algorithm. Please check your inputs or try again later.', 400


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
