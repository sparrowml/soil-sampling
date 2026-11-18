import numpy as np
import pytest
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
from soil_sampling.clustering import grid_regions


@pytest.mark.parametrize('outline', [
    [(0,0),(33,0),(33,31),(0,31)],
    [(0,0),(33,0),(33,31),(20,31),(20,8),(8,8),(8,31),(0,31)],
    [(0,0),(33,0),(33,31),(16,8),(0,31)],
])
@pytest.mark.parametrize('pattern', ['island', 'checker', 'bands'])
def test_partition(outline, pattern):
    poly = Polygon(outline)
    x, y = np.meshgrid(np.arange(0,33,5), np.arange(0,31,5))
    grid = np.stack([x.ravel(), y.ravel()], -1)
    mask = np.array([poly.contains(Point(p)) for p in grid])
    points = grid[mask]
    if pattern == 'island':
        classes = ((points[:,0] == 15) & (points[:,1] == 15)).astype(int)
    elif pattern == 'checker':
        classes = (points.sum(axis=1) / 5).astype(int) % 3
    else:
        classes = (points[:,0] // 12).astype(int)
    rings, labels = grid_regions(poly, grid, mask, classes)
    regions = [Polygon(ring) for ring in rings]
    union = unary_union(regions)
    assert all(region.is_valid and not region.interiors for region in regions)
    assert union.symmetric_difference(poly).area < 1e-8
    assert abs(sum(region.area for region in regions) - union.area) < 1e-8
    assert set(labels) == {f'Cluster: {label+1}' for label in classes}


def test_concave_fragment_sampling():
    from soil_sampling.clustering import sample_fragment
    poly = Polygon([(0,0),(10,0),(10,1),(1,1),(1,10),(0,10)])
    points = sample_fragment(poly, 20)
    assert len(points) == 20
    assert all(poly.covers(Point(point)) for point in points)
