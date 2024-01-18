from collections import defaultdict
from typing import Generator, List, Tuple

import numpy as np
import requests
from bs4 import BeautifulSoup
from scipy.spatial import Voronoi
from shapely.geometry import MultiPolygon, Polygon
from shapely.geometry import mapping as shapely_mapping

from .uniform import uniform_sample


def get_components(data: np.ndarray, n_components: int = 2) -> np.ndarray:
    cov_mat = np.cov(data.T)  # <-- get the covariance matrix

    ## calculate eigenvalues of the covariance matrix
    eig_val, eig_vec = np.linalg.eig(cov_mat)

    # sort components, largest to smallest
    idx_sort = np.flip(
        eig_val.argsort()
    )  # <-- get ordering of eigenvectors: largest to smallest
    components = eig_vec[:, idx_sort]
    return data @ components[:, :n_components]


def voronoi_sample(
    polygon: np.ndarray, n_points: int
) -> tuple[np.ndarray, list[np.ndarray]]:
    """Select n points with Lloyds algorithm inside a polygon"""
    polygon_min = polygon.min(axis=0)
    normalized_polygon = polygon - polygon_min
    starters = np.random.permutation(uniform_sample(normalized_polygon))[:n_points]
    try:
        points, regions = lloyds_algorithm(starters, normalized_polygon)
    except:
        return fake_voronoi_sample(polygon, n_points), []
    points += polygon_min
    updated_regions = []
    for region in regions:
        region += polygon_min
        if region.ndim == 2:
            updated_regions.append(region)
        else:
            for subregion in region:
                updated_regions.append(subregion)
    return points, updated_regions


def fake_voronoi_sample(polygon: np.ndarray, n_points: int) -> np.ndarray:
    """Randomly select n uniform grid points inside a smaller polygon"""
    xmin = polygon[:, 0].min()
    ymin = polygon[:, 1].min()
    polygon[:, 0] -= xmin
    polygon[:, 1] -= ymin
    points = uniform_sample(polygon)
    if len(points) < 2:
        shapely_polygon = Polygon(polygon)
        point = shapely_polygon.centroid
        if not shapely_polygon.contains(point):
            return
        points = np.array(point)[None]
    else:
        rotated = get_components(points, 2)
        meter_bin = 25

        dim1_bins = np.floor((rotated[:, 0] - rotated[:, 0].min()) / meter_bin)
        dim2_bins = np.floor((rotated[:, 1] - rotated[:, 1].min()) / meter_bin)
        percentiles = [round(100 * (i + 1) / (n_points + 1)) for i in range(n_points)]

        indices = np.arange(len(points))
        picked_points = []

        for _p in np.percentile(dim1_bins, percentiles):
            p = dim1_bins[np.argmin(np.abs(_p - dim1_bins))]
            mask = dim1_bins == p
            masked_dim2 = dim2_bins[mask]
            _m = np.median(masked_dim2)
            median_i = np.argmin(np.abs(_m - masked_dim2))
            picked_points.append(points[indices[mask][median_i]])

        points = np.stack(picked_points, 0)
    points[:, 0] += xmin
    points[:, 1] += ymin
    return points


def lloyds_algorithm(
    starters: np.ndarray, boundary: np.ndarray
) -> tuple[np.ndarray, list[np.ndarray]]:
    """Get the optimally spaced points inside a boundary polygon"""
    shapely_boundary = Polygon(boundary)
    diameter = np.linalg.norm(boundary.ptp(axis=0))
    points = starters
    for _ in range(20):
        regions = []
        new_points = []
        for unbounded_region in voronoi_polygons(Voronoi(points), diameter):
            region = unbounded_region.intersection(shapely_boundary)
            for _polygon in shapely_mapping(region)["coordinates"]:
                regions.append(np.array(_polygon))
            centroid = np.array(region.centroid)
            if centroid.shape == (2,):
                new_points.append(centroid)
        new_points = np.stack(new_points)
        points = new_points
    return points, regions


def voronoi_polygons(
    voronoi: Voronoi, diameter: float
) -> Generator[Polygon, None, None]:
    """Generate polygons objects corresponding to the regions of a Voronoi object"""
    centroid = voronoi.points.mean(axis=0)

    # Mapping from (input point index, Voronoi point index) to list of
    # unit vectors in the directions of the infinite ridges starting
    # at the Voronoi point and neighbouring the input point.
    ridge_direction = defaultdict(list)
    for (p, q), rv in zip(voronoi.ridge_points, voronoi.ridge_vertices):
        u, v = sorted(rv)
        if u == -1:
            # Infinite ridge starting at ridge point with index v,
            # equidistant from input points with indexes p and q.
            t = voronoi.points[q] - voronoi.points[p]  # tangent
            n = np.array([-t[1], t[0]]) / np.linalg.norm(t)  # normal
            midpoint = voronoi.points[[p, q]].mean(axis=0)
            direction = np.sign(np.dot(midpoint - centroid, n)) * n
            ridge_direction[p, v].append(direction)
            ridge_direction[q, v].append(direction)

    for i, r in enumerate(voronoi.point_region):
        region = voronoi.regions[r]
        if -1 not in region:
            # Finite region.
            yield Polygon(voronoi.vertices[region])
            continue
        # Infinite region.
        inf = region.index(-1)  # Index of vertex at infinity.
        j = region[(inf - 1) % len(region)]  # Index of previous vertex.
        k = region[(inf + 1) % len(region)]  # Index of next vertex.
        if j == k:
            # Region has one Voronoi vertex with two ridges.
            dir_j, dir_k = ridge_direction[i, j]
        else:
            # Region has two Voronoi vertices, each with one ridge.
            (dir_j,) = ridge_direction[i, j]
            (dir_k,) = ridge_direction[i, k]

        # Length of ridges needed for the extra edge to lie at least
        # 'diameter' away from all Voronoi vertices.
        length = 2 * diameter / np.linalg.norm(dir_j + dir_k)

        # Polygon consists of finite part plus an extra edge.
        finite_part = voronoi.vertices[region[inf + 1 :] + region[:inf]]
        extra_edge = [
            voronoi.vertices[j] + dir_j * length,
            voronoi.vertices[k] + dir_k * length,
        ]
        yield Polygon(np.concatenate((finite_part, extra_edge)))


def get_mukey_regions(polygon: np.ndarray) -> Tuple[List[np.ndarray], List[str]]:
    min_lon, min_lat = polygon.min(axis=0)
    max_lon, max_lat = polygon.max(axis=0)
    shapely_polygon = Polygon(polygon)

    url = "https://sdmdataaccess.nrcs.usda.gov/Spatial/SDMWGS84Geographic.wfs"
    xml_filter = f"""
    <Filter>
      <BBOX>
        <PropertyName>Geometry</PropertyName>
        <Box srsName=\'EPSG:4326\'>
          <coordinates>{min_lon},{min_lat} {max_lon},{max_lat}</coordinates>
        </Box>
      </BBOX>
    </Filter>
    """
    params = dict(
        SERVICE="WFS",
        VERSION="1.1.0",
        REQUEST="GetFeature",
        TYPENAME="MapunitPoly",
        FILTER=xml_filter,
    )
    response = requests.get(url, params=params)
    soup = BeautifulSoup(response.content, features="html.parser")

    shapely_regions = []
    mukey_ids = []
    for feature_member in soup.find_all("gml:featuremember"):
        mukey_id = feature_member.find("ms:mukey").text
        points = (
            feature_member.find("gml:outerboundaryis")
            .find("gml:coordinates")
            .text.split()
        )
        points = np.array([list(map(float, p.split(","))) for p in points])
        points = points[:, ::-1]
        shapely_mukey = Polygon(points)
        shapely_mukey = shapely_polygon.intersection(shapely_mukey)
        if isinstance(shapely_mukey, MultiPolygon):
            multi_regions = [
                np.stack(mk.exterior.coords.xy, -1) for mk in shapely_mukey
            ]
            shapely_regions += multi_regions
            mukey_ids += [mukey_id] * len(multi_regions)
        else:
            if shapely_mukey.exterior.coords:
                shapely_regions.append(np.stack(shapely_mukey.exterior.coords.xy, -1))
                mukey_ids.append(mukey_id)
    return shapely_regions, mukey_ids
