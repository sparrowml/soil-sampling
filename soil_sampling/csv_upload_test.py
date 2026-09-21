import importlib
import io
import json
from pathlib import Path

import numpy as np
import pytest

from soil_sampling.csv_upload import read_csv

api = importlib.import_module('soil_sampling.app')
EXAMPLES = Path(__file__).parent.parent / 'examples'
OPTIONS = json.loads((EXAMPLES / 'clustering.json').read_text())
CSV = (EXAMPLES / 'clustering.csv').read_bytes()


def upload(client, csv=CSV, **options):
    return client.post('/clustering', data={'options': json.dumps({**OPTIONS, **options}), 'pointDataCsv': (io.BytesIO(csv), 'points.csv')})


def test_csv_pipeline(monkeypatch):
    # Exercise real interpolation, clustering, region construction and sampling;
    # only the unrelated external elevation enrichment is stubbed.
    monkeypatch.setattr(api, 'enrich_points', lambda points, *args: ['Elevation: 350.00'] * len(points))
    np.random.seed(4)
    response = upload(api.app.test_client())
    assert response.status_code == 200, response.text
    result = response.json
    assert result['points'] and result['regions']
    assert len(result['points']) == len(result['point_enrichments']) == len(result['point_descriptions'])


@pytest.mark.parametrize('csv,message', [
    (b'lat,lon\n41,-96\n', 'requires lat'),
    (b'lat,lon,x,x\n41,-96,1,2', 'unique'),
    (b'lat,lon,x\n41,-96,no', 'numeric'),
    (b'lat,lon,x\n41,-96,nan', 'non-finite'),
    (b'lat,lon,x\n41,-96,1,2', 'number of columns'),
    (b'lat,lon,x\n91,-96,1\n41,-97,2\n41,-98,3', 'coordinates'),
    (b'lat,lon,x\n41,-96,1', 'at least 3'),
    (b'lat,lon,x\n41,-96,1\n41,-97,1\n41,-98,1', 'value combinations'),
])
def test_invalid_csv(csv, message):
    response = upload(api.app.test_client(), csv)
    assert response.status_code == 400
    assert message in response.text


def test_limits():
    client = api.app.test_client()
    assert upload(client, CSV, nPoints=0).status_code == 400
    assert upload(client, CSV, includeElevation='false').status_code == 400
    assert upload(client, b'a' * (5 * 1024 * 1024)).status_code == 413
    response = upload(client, polygon=[[-96.5,41.1],[-96.4,41.1],[-96.4,41.101],[-96.5,41.101]])
    assert response.status_code == 400 and 'grid limit' in response.text
    with pytest.raises(ValueError, match='row limit'):
        read_csv(io.BytesIO(b'lon,lat,x\n' + b'-96,41,1\n' * 10001))
    response = upload(client, b'lat,lon,a,b,c\n41,-96,1,2,3\n42,-96,2,3,4\n43,-96,3,4,5', includeElevation=True)
    assert response.status_code == 400 and 'maximum of 3' in response.text


def test_legacy_json_and_individual_fields(monkeypatch):
    received = []
    def cluster(polygon, zone, letter, elevation, data):
        received.append(data)
        raise api.DimensionException()
    monkeypatch.setattr(api, 'cluster_regions', cluster)
    monkeypatch.setattr(api, 'download_shapefile', lambda url: read_csv(io.BytesIO(CSV)))
    client = api.app.test_client()
    response = client.post('/clustering', json={**OPTIONS, 'pointDataShapefile': 'https://example.test/data.zip'})
    assert response.status_code == 400 and 'dimensions' in response.text
    response = client.post('/clustering', data={**{key: json.dumps(value) for key,value in OPTIONS.items()}, 'pointDataCsv': (io.BytesIO(CSV), 'points.csv')})
    assert response.status_code == 400 and 'dimensions' in response.text
    assert len(received) == 2
    assert received[0].equals(received[1])
