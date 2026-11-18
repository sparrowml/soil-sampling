"""Synthetic-only regressions: private agricultural observations are not fixtures."""
import io
import json

import numpy as np
import pandas as pd
import pytest
import utm
from shapely.geometry import Polygon, MultiPolygon, Point, box, mapping, shape
from shapely.ops import transform, unary_union

from soil_sampling.zones import cluster_zones, sample_zones, smooth_inside, classify, standardize
from soil_sampling.clustering import exterior_parts
from soil_sampling.csv_upload import read_csv
import importlib
api = importlib.import_module('soil_sampling.app')

ZONE, LETTER = 14, 'T'
X, Y = 600000., 4500000.


def geographic(geometry):
    def convert(x, y, z=None):
        lat, lon = utm.to_latlon(np.asarray(x), np.asarray(y), ZONE, LETTER)
        return lon, lat
    return transform(convert, geometry)


def observations(noisy=False):
    x, y = np.meshgrid(np.arange(X+2.5, X+600, 5), np.arange(Y+2.5, Y+600, 5))
    points = np.column_stack([x.ravel(), y.ravel()])
    # Under CSV row limit, with spatially separate base classes and speckles.
    points = points[::2]
    values = np.floor((points[:, 0]-X)/200)
    if noisy:
        rng = np.random.default_rng(98)
        mask = rng.random(len(values)) < .18
        values[mask] = rng.integers(0, 3, mask.sum())
    lat, lon = utm.to_latlon(points[:, 0], points[:, 1], ZONE, LETTER)
    return pd.DataFrame({'lat': lat, 'lon': lon, 'ECD': values*100+1, 'Elev': values*10+300})


def test_speckle_reduction_preserves_major_regions_and_is_reproducible():
    field = box(X, Y, X+600, Y+600)
    data = observations(noisy=True)
    before, _, old = cluster_zones(field, ZONE, LETTER, False, data, {'smoothingCells': 1, 'minPatchAreaM2': 0})
    after, labels, diagnostics = cluster_zones(field, ZONE, LETTER, False, data)
    assert len(after) < len(before)/5
    assert len(set(labels)) == 3
    assert diagnostics['cells_reassigned'] > 0
    again, again_labels, again_diagnostics = cluster_zones(field, ZONE, LETTER, False, data)
    assert labels == again_labels and diagnostics == again_diagnostics
    assert all(a.equals(b) for a,b in zip(after, again))
    assert unary_union(after).symmetric_difference(field).area < 1e-6


@pytest.mark.parametrize('count', [1, 2, 5, 15, 30, 200])
def test_holes_detached_subgrid_piece_and_exact_samples(count):
    main = box(X, Y, X+120, Y+160).difference(box(X+30,Y+30,X+90,Y+130))
    # Separate physical components, including one smaller than a grid cell.
    field = MultiPolygon([main, box(X+150,Y,X+180,Y+60), box(X+190,Y+20,X+190.8,Y+20.5)])
    data = observations()
    data['ECD'] = data.lat * 1e4
    zones, descriptions, diagnostics = cluster_zones(field, ZONE, LETTER, False, data, {'smoothingCells': 1})
    result, labels, ids, allocations = sample_zones(zones, descriptions, count)
    assert len(result) == len(np.unique(result, axis=0)) == count
    assert unary_union(zones).symmetric_difference(field).area < 1e-6
    assert abs(sum(p.area for p in zones)-field.area) < 1e-6
    assert all(field.covers(Point(p)) and zones[c-1].covers(Point(p)) and descriptions[c-1] == label
               for p,c,label in zip(result, ids, labels))
    assert sum(allocations) == count
    for p in zones:
        parts = list(exterior_parts(p))
        assert unary_union(parts).symmetric_difference(p).area < 1e-6
        assert not any(part.interiors for part in parts)


def test_smoothing_does_not_cross_subgrid_gap():
    field = MultiPolygon([box(0,0,4.9,20), box(5.1,0,10,20)])
    grid = np.array([[x,y] for y in (2.5,7.5,12.5,17.5) for x in (2.5,7.5)])
    values = np.array([[0.] if x<5 else [100.] for x,y in grid])
    smooth = smooth_inside(values, grid, np.ones(len(grid),bool), 2, field, 3)
    np.testing.assert_array_equal(smooth, values)


def test_constant_and_units_extremes():
    with pytest.raises(ValueError, match='no variation'):
        classify(np.zeros((10,3)))
    values = np.array([[0.,10.],[1.,11.],[8.,18.],[9.,19.],[20.,30.],[21.,31.]])
    np.testing.assert_allclose(standardize(values), standardize(values*np.array([1e280,1e-280])), atol=1e-12)
    np.testing.assert_array_equal(classify(standardize(values)), classify(standardize(values*np.array([1e280,1e-280]))))


def test_csv_missing_counts_and_duplicate_locations():
    csv = b'Longitude,Latitude,a,unused\n-96,41,1,\n-96,41.001,2,\n-96,41.002,3,\n-96,41.002,3,\n-96,41.003,,\n,,,\n'
    data=read_csv(io.BytesIO(csv))
    report=data.attrs['input_diagnostics']
    assert report['rows_read']==6 and report['rows_retained']==3
    assert report['rows_incomplete']==report['rows_empty']==report['rows_duplicate']==1
    assert report['ignored_empty_column_count']==1
    with pytest.raises(ValueError, match='conflicting'):
        read_csv(io.BytesIO(csv+b'-96,41.002,7,\n'))
    with pytest.raises(ValueError, match='1000 column'):
        read_csv(io.BytesIO(b','.join([b'x']*1001)))


@pytest.mark.parametrize('count', [1,200])
def test_api_elevation_precedence_hole_geometry_and_sampling(monkeypatch, count):
    def no_elevation_fetch(*args, **kwargs):
        raise AssertionError('Uploaded elevation must not be fetched again for clustering')
    monkeypatch.setattr('soil_sampling.clustering.py3dep.elevation_bycoords', no_elevation_fetch)
    enrich_calls=[]
    monkeypatch.setattr(api,'enrich_points',lambda points,*args: enrich_calls.append(len(points)) or ['Elev: 300']*len(points))
    field=box(X,Y,X+600,Y+600).difference(box(X+100,Y+100,X+200,Y+300))
    data=observations()[::5]
    data['Yield']=data.ECD*2+1
    options={'polygonGeoJson':mapping(geographic(field)),'includeElevation':True,'nPoints':count}
    response=api.app.test_client().post('/clustering',data={'options':json.dumps(options),'pointDataCsv':(io.BytesIO(data.to_csv(index=False).encode()),'synthetic.csv')})
    assert response.status_code==200,response.text
    result=response.json
    assert enrich_calls==[count]
    assert result['diagnostics']['input']['elevation']['used_automatic'] is False
    assert result['diagnostics']['warnings']
    assert len(result['points'])==count and len({tuple(p) for p in result['points']})==count
    features=result['regions_geojson']['features']
    for point,label,component in zip(result['points'],result['point_descriptions'],result['point_component_ids']):
        feature=features[component-1]
        assert feature['properties']['description']==label
        assert shape(feature['geometry']).covers(Point(point))
    for label in set(result['region_descriptions']):
        flat=unary_union([Polygon(r) for r,d in zip(result['regions'],result['region_descriptions']) if d==label])
        rich=unary_union([shape(f['geometry']) for f in features if f['properties']['description']==label])
        assert flat.symmetric_difference(rich).area < 1e-12


@pytest.mark.parametrize('options', [{'smoothingCells':2},{'smoothingCells':True},{'minPatchAreaM2':-1},{'minPatchAreaM2':float('inf')},{'minPatchAreaM2':10**200}])
def test_bounded_cleanup_options(options):
    response=api.app.test_client().post('/clustering',json={'clusteringOptions':options})
    assert response.status_code==400
    assert 'must be' in response.text


def test_concave_sampling_uses_full_polygon_support():
    from shapely.ops import triangulate
    polygon=Polygon([(8,0),(-19,18),(-128,30),(-4,0),(-85,-11),(-11,-38),(-2,-17),(-2,-20),(0,-1),(14,-64)])
    old_support=unary_union([t for t in triangulate(polygon) if polygon.covers(t)])
    assert old_support.area/polygon.area < .06
    points, _, _, _ = sample_zones([polygon], ['Cluster: 1'], 30)
    assert all(polygon.covers(Point(p)) for p in points)
    assert sum(not old_support.covers(Point(p)) for p in points) >= 20


def test_legacy_shapefile_missing_measurement_sites():
    data=observations()[::20].copy()
    data.iloc[0,data.columns.get_loc('ECD')]=np.nan
    zones,_,_=cluster_zones(box(X,Y,X+600,Y+600),ZONE,LETTER,False,data)
    assert zones
