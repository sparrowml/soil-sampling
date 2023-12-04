import pytest
from flask import Flask
from flask.testing import FlaskClient

from .app import app as _app


@pytest.fixture
def app() -> Flask:
    _app.config.update(
        {
            "TESTING": True,
        }
    )
    yield _app


@pytest.fixture
def client(app: Flask) -> FlaskClient:
    return app.test_client()


POLYGON = [
    [-96.47882643688598, 41.16871517217296],
    [-96.48275970434666, 41.16639897205994],
    [-96.48082479051511, 41.16202901076274],
    [-96.4763205648748, 41.16155140169951],
    [-96.4734023341777, 41.16336629762207],
    [-96.4744173709418, 41.16787943930536],
    [-96.47882643688598, 41.16871517217296],
]
LARGE_POLYGON = [
    [-96.60259503656569, 41.24930694871123],
    [-96.49592539790267, 41.12561457973746],
    [-96.44044571590696, 41.31365031391488],
    [-96.60259503656569, 41.24930694871123],
]
CLUSTERING_POLYGON = [
    [-96.46895154557672, 41.16833861956085],
    [-96.47238993837597, 41.16323898810186],
    [-96.46890535170685, 41.16207840278774],
    [-96.46621271647872, 41.16301548619598],
    [-96.46601492036488, 41.16586877928358],
    [-96.46895154557672, 41.16833861956085],
]


def test_uniform(client: FlaskClient):
    acres = [1, 2.5, 5]
    triangle_offsets = [True, False]
    for _acres in acres:
        for _triangle_offset in triangle_offsets:
            request = {
                "polygon": POLYGON,
                "acre": str(_acres),
                "triangleOffset": _triangle_offset,
            }
            response = client.post("/uniform", json=request)
            assert response.status_code == 200

    # No polygon
    bad_request = {"acre": "1", "triangleOffset": True}
    response = client.post("/uniform", json=bad_request)
    assert response.status_code == 400

    # Large area
    bad_request = {
        "polygon": LARGE_POLYGON,
        "acre": "1",
        "triangleOffset": True,
    }
    response = client.post("/uniform", json=bad_request)
    assert response.status_code == 400

    # Screw up the algorithm
    bad_request = {
        "polygon": POLYGON,
        "acre": "0",
        "triangleOffset": True,
    }
    response = client.post("/uniform", json=bad_request)
    assert response.status_code == 400


def test_voronoi(client: FlaskClient):
    request = {"polygon": POLYGON, "nPoints": 50}
    response = client.post("/voronoi", json=request)
    assert response.status_code == 200


def test_clustering(client: FlaskClient):
    request = {
        "polygon": CLUSTERING_POLYGON,
        "nPoints": 25,
        "pointDataShapefile": "https://sparrowcomputing.s3.amazonaws.com/soil-sampling-test.zip",
    }
    response = client.post("/clustering", json=request)
    assert response.status_code == 200
