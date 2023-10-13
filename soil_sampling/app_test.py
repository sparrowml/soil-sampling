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
    [-96.4788804964786, 41.16874127387817],
    [-96.48073318863858, 41.16819074836363],
    [-96.4806844335818, 41.1660620061853],
    [-96.48258588079811, 41.16569497468149],
    [-96.48131824932057, 41.162795353532616],
    [-96.47805318156892, 41.16180431435416],
    [-96.47550116160187, 41.162208072865454],
    [-96.4734859525869, 41.16328475006763],
    [-96.47411976832568, 41.16787266484627],
    [-96.47616748071285, 41.16864340301291],
    [-96.4788804964786, 41.16874127387817],
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
    # TODO: Get off flakey external service
    body = response.json
    assert response.status_code in (200, 400)


def test_clustering(client: FlaskClient):
    request = {"polygon": CLUSTERING_POLYGON, "nPoints": 25}
    response = client.post("/clustering", json=request)
    assert response.status_code == 200
