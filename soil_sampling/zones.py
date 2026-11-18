"""Bounded, deterministic staging clustering; no external CLI or field fixtures."""
import heapq

import numpy as np
import utm
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
from scipy.spatial import cKDTree
from shapely.geometry import Point, LineString, box
from shapely.ops import unary_union
from shapely.prepared import prep

from .clustering import polygon_parts, exterior_parts

GRID_METERS = 5
MAX_GRID_CELLS = 100000


def standardize(values):
    """Unit-independent distances, avoiding overflow for finite large inputs."""
    values = np.asarray(values, dtype=float)
    if not np.isfinite(values).all():
        raise ValueError('Clustering measurements must be finite.')
    scale = np.max(np.abs(values), axis=0)
    scaled = values / np.where(scale > 0, scale, 1)
    centered = scaled - scaled.mean(axis=0)
    deviation = centered.std(axis=0)
    return centered / np.where(deviation > 1e-12, deviation, 1)


def classify(values):
    """Fixed maximum of three classes, deterministic k-means++ restarts."""
    unique = np.unique(values, axis=0)
    k = min(3, len(unique))
    if k < 2:
        raise ValueError('The selected measurements have no variation inside this area. Choose another measurement or area.')
    best = None
    for seed in range(5):
        rng = np.random.default_rng(seed)
        centers = [values[rng.integers(len(values))]]
        for _ in range(1, k):
            distance = np.min(np.sum((values[:, None] - np.asarray(centers)) ** 2, axis=2), axis=1)
            centers.append(values[rng.choice(len(values), p=distance / distance.sum())])
        centers = np.asarray(centers)
        previous = None
        for _ in range(100):
            distances = np.sum((values[:, None] - centers) ** 2, axis=2)
            labels = distances.argmin(axis=1)
            if previous is not None and np.array_equal(labels, previous):
                break
            previous = labels.copy()
            for label in range(k):
                subset = values[labels == label]
                centers[label] = subset.mean(axis=0) if len(subset) else values[distances.min(axis=1).argmax()]
        score = np.sum((values - centers[labels]) ** 2)
        if best is None or score < best[0]:
            best = score, labels.copy(), centers.copy()
    _, labels, centers = best
    # Stable class numbering for the same measurements and geometry.
    order = np.lexsort(centers.T[::-1])
    remap = np.empty(k, dtype=int)
    remap[order] = np.arange(k)
    return remap[labels]


def grid_edges(grid, inside, nx, field):
    """Only actual within-AOI neighbor links; never bridge a hole or gap."""
    ids = np.arange(len(grid)).reshape(-1, nx)
    a = np.r_[ids[:, :-1].ravel(), ids[:-1].ravel()]
    b = np.r_[ids[:, 1:].ravel(), ids[1:].ravel()]
    valid = inside[a] & inside[b]
    a, b = a[valid], b[valid]
    prepared = prep(field)
    valid = np.ones(len(a), dtype=bool) if field.equals(field.convex_hull) else np.fromiter(
        (prepared.covers(LineString([grid[i], grid[j]])) for i, j in zip(a, b)), bool, len(a))
    mapping = np.full(len(grid), -1, dtype=int)
    mapping[inside] = np.arange(inside.sum())
    return mapping[a[valid]], mapping[b[valid]]


def smooth_inside(values, grid, inside, nx, field, width):
    """Median of valid local neighbors, never across an AOI hole or gap."""
    ids = np.flatnonzero(inside)
    row, column = np.divmod(ids, nx)
    ny = len(grid) // nx
    neighbors = []
    prepared = prep(field)
    convex = field.equals(field.convex_hull)
    radius = width // 2
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            valid = (row + dy >= 0) & (row + dy < ny) & (column + dx >= 0) & (column + dx < nx)
            target = np.clip(ids + dy * nx + dx, 0, len(grid)-1)
            valid &= inside[target]
            if not convex and (dy or dx):
                positions = np.flatnonzero(valid)
                valid[positions] = [prepared.covers(LineString([grid[ids[i]], grid[target[i]]])) for i in positions]
            sample = values[target].copy()
            sample[~valid] = np.nan
            neighbors.append(sample)
    return np.nanmedian(np.stack(neighbors), axis=0)


def cleanup(labels, values, edges, minimum_cells):
    """Contract small connected patches into a real adjacent class.

    Larger patches are retained. Contact length and standardized measurement
    similarity choose a neighbor. Every contraction removes a graph node, so
    work is bounded by the number of classified grid cells.
    """
    a, b = edges
    same = labels[a] == labels[b]
    graph = coo_matrix((np.ones(same.sum()), (a[same], b[same])), shape=(len(labels), len(labels))).tocsr()
    count, component = connected_components(graph, directed=False)
    size = np.bincount(component).astype(int)
    sums = np.zeros((count, values.shape[1]))
    np.add.at(sums, component, values)
    classes = np.zeros(count, dtype=int)
    classes[component] = labels
    neighbors = [dict() for _ in range(count)]
    for x, y in zip(component[a], component[b]):
        if x != y:
            neighbors[x][y] = neighbors[x].get(y, 0) + 1
            neighbors[y][x] = neighbors[y].get(x, 0) + 1
    parent = np.arange(count)
    queue = [(int(n), i) for i, n in enumerate(size) if n < minimum_cells]
    heapq.heapify(queue)

    def merge(source, target):
        parent[source] = target
        size[target] += size[source]
        sums[target] += sums[source]
        size[source] = 0
        neighbors[target].pop(source, None)
        for neighbor, contact in list(neighbors[source].items()):
            neighbors[neighbor].pop(source, None)
            if neighbor != target:
                neighbors[target][neighbor] = neighbors[target].get(neighbor, 0) + contact
                neighbors[neighbor][target] = neighbors[neighbor].get(target, 0) + contact
        neighbors[source].clear()

    while queue:
        old_size, source = heapq.heappop(queue)
        if size[source] != old_size or size[source] >= minimum_cells or not neighbors[source]:
            continue
        source_mean = sums[source] / size[source]
        target = max(neighbors[source], key=lambda j: (
            neighbors[source][j] / (1 + np.linalg.norm(source_mean - sums[j] / size[j])),
            size[j], -j))
        merge(source, target)
        # Coalesce touching pieces of the receiving class after reassignment.
        while True:
            same_class = [j for j in neighbors[target] if classes[j] == classes[target]]
            if not same_class:
                break
            merge(min(same_class), target)
        if size[target] < minimum_cells:
            heapq.heappush(queue, (int(size[target]), target))
    for i in range(count):
        node = i
        while parent[node] != node:
            node = parent[node]
        parent[i] = node
    clean = classes[parent[component]]
    return clean, {'raw_grid_components': int(count), 'clean_grid_components': int(np.count_nonzero(size)),
                   'cells_reassigned': int(np.count_nonzero(clean != labels))}


def polygons_from_grid(field, grid, inside, labels, nx):
    extended = np.empty(len(grid), dtype=int)
    extended[inside] = labels
    if (~inside).any():
        _, nearest = cKDTree(grid[inside]).query(grid[~inside])
        extended[~inside] = labels[nearest]
    xs, ys = np.unique(grid[:, 0]), np.unique(grid[:, 1])
    xmin, ymin, xmax, ymax = field.bounds
    xe = np.r_[xmin, (xs[:-1] + xs[1:]) / 2, xmax]
    ye = np.r_[ymin, (ys[:-1] + ys[1:]) / 2, ymax]
    runs = {int(label): [] for label in np.unique(extended)}
    for row, values in enumerate(extended.reshape(-1, nx)):
        breaks = np.r_[0, np.flatnonzero(values[1:] != values[:-1]) + 1, nx]
        for start, end in zip(breaks[:-1], breaks[1:]):
            runs[int(values[start])].append(box(xe[start], ye[row], xe[end], ye[row + 1]))
    zones, descriptions = [], []
    for label, cells in sorted(runs.items()):
        geometry = unary_union(cells).intersection(field)
        for polygon in sorted(polygon_parts(geometry), key=lambda p: (*p.bounds, p.area)):
            if polygon.area > 0:
                zones.append(polygon)
                descriptions.append(f'Cluster: {label + 1}')
    return zones, descriptions


def cluster_zones(field, zone, letter, include_elevation, point_data, config=None):
    from .clustering import py3dep
    config = config or {}
    smooth = config.get('smoothingCells', 3)
    min_patch = config.get('minPatchAreaM2', 5000.)
    xmin, ymin, xmax, ymax = field.bounds
    nx, ny = np.ceil(np.array([xmax - xmin, ymax - ymin]) / GRID_METERS).astype(int)
    if nx * ny > MAX_GRID_CELLS or nx * ny == 0:
        raise ValueError('Polygon bounding box exceeds the 100000 cell clustering grid limit; reduce its extent.')
    xx, yy = np.meshgrid(xmin + (np.arange(nx) + .5) * GRID_METERS,
                         ymin + (np.arange(ny) + .5) * GRID_METERS)
    grid = np.column_stack([xx.ravel(), yy.ravel()])
    prepared = prep(field)
    inside = np.fromiter((prepared.contains(Point(p)) for p in grid), bool, len(grid))
    if not inside.any():
        raise ValueError('The area of interest is too narrow for the 5-meter clustering grid. Enlarge it and try again.')
    columns, names = [], []
    if include_elevation:
        lat, lon = utm.to_latlon(grid[:, 0], grid[:, 1], zone, letter)
        columns.append(np.asarray(py3dep.elevation_bycoords(np.column_stack([lon, lat])), dtype=float))
        names.append('fetched_elevation')
    if point_data is not None:
        x, y, _, __ = utm.from_latlon(point_data.lat.values, point_data.lon.values, zone, letter)
        # A deterministic coordinate ordering makes equal-distance ties stable.
        order = np.lexsort((y, x))
        sites = np.column_stack([x, y])[order]
        for name in point_data.columns:
            if name not in ('lat', 'lon'):
                measurements = point_data[name].to_numpy(dtype=float)[order]
                valid = np.isfinite(measurements)
                if not valid.any():
                    raise ValueError(f'Measurement {name} has no finite observations.')
                _, nearest = cKDTree(sites[valid]).query(grid)
                columns.append(measurements[valid][nearest])
                names.append(name)
    if not 1 <= len(columns) <= 3:
        raise ValueError('Choose 1 to 3 clustering measurements, including elevation.')
    raw = np.column_stack(columns)
    if not np.isfinite(raw).all():
        raise ValueError('Clustering measurements must be finite; the elevation service may be unavailable.')
    # Local median suppresses single-cell speckle before unit standardization.
    smoothed = smooth_inside(raw, grid, inside, nx, field, smooth)
    values = standardize(smoothed)
    labels = classify(values)
    minimum_area = min(float(min_patch), field.area * .01)
    minimum_cells = max(1, int(np.ceil(minimum_area / GRID_METERS ** 2)))
    clean, diagnostics = cleanup(labels, values, grid_edges(grid, inside, nx, field), minimum_cells)
    zones, descriptions = polygons_from_grid(field, grid, inside, clean, nx)
    union = unary_union(zones)
    tolerance = max(1e-6, field.area * 1e-9)
    if not zones or any(not p.is_valid for p in zones) or union.symmetric_difference(field).area > tolerance or abs(sum(p.area for p in zones) - union.area) > tolerance:
        raise ValueError('Unable to construct a valid complete partition of this area.')
    diagnostics.update({'algorithm': 'fixed-three-standardized-spatial-v1', 'features': names,
                        'grid_m': GRID_METERS, 'grid_cells': int(inside.sum()), 'smoothing_cells': smooth,
                        'min_patch_area_m2': minimum_area, 'min_patch_area_requested_m2': min_patch,
                        'patch_area_cap_fraction': .01, 'components': len(zones),
                        'classes': len(set(descriptions)), 'fraction_cells_reassigned': diagnostics['cells_reassigned'] / int(inside.sum()),
                        'legacy_rings': sum(1 for p in zones for _ in exterior_parts(p)),
                        'coverage_missing_m2': float(field.difference(union).area),
                        'coverage_extra_m2': float(union.difference(field).area),
                        'overlap_m2': float(abs(sum(p.area for p in zones) - union.area))})
    return zones, descriptions, diagnostics


def sample_zones(zones, descriptions, count):
    """Area allocation and constrained Lloyd refinement; holes stay excluded."""
    areas = np.array([p.area for p in zones])
    allocations = np.zeros(len(zones), dtype=int)
    classes = sorted(set(descriptions))
    if count >= len(classes):
        for label in classes:
            candidates = [i for i, d in enumerate(descriptions) if d == label]
            allocations[max(candidates, key=lambda i: areas[i])] += 1
    for _ in range(count - allocations.sum()):
        allocations[np.argmax(areas / (2 * allocations + 1))] += 1
    points, labels, component_ids = [], [], []
    candidate_draws = 0
    for component, (polygon, description, number) in enumerate(zip(zones, descriptions, allocations), 1):
        if not number:
            continue
        # Rejection from the full polygon bbox gives every legal part support.
        # Unconstrained Delaunay triangles wholly inside a concave polygon can
        # cover only a small fraction of its area, so must not define support.
        rng = np.random.default_rng(component)
        candidate_count = min(8000, max(400, int(number) * 40))
        xmin, ymin, xmax, ymax = polygon.bounds
        acceptance = polygon.area / ((xmax-xmin)*(ymax-ymin))
        prepared = prep(polygon)
        accepted, retained = [], 0
        while retained < candidate_count:
            batch_size = min(50000, max(100, int(np.ceil((candidate_count-retained)/acceptance*1.2))))
            batch_size = min(batch_size, 1000000 - candidate_draws)
            if batch_size <= 0:
                raise ValueError('This area is too narrow or complex to sample within the processing limit. Adjust the area or point count.')
            batch = rng.uniform([xmin,ymin], [xmax,ymax], size=(batch_size,2))
            candidate_draws += batch_size
            valid = np.fromiter((prepared.contains(Point(p)) for p in batch), bool, batch_size)
            accepted.append(batch[valid]); retained += int(valid.sum())
        candidates = np.unique(np.concatenate(accepted)[:candidate_count], axis=0)
        if len(candidates) < number:
            raise ValueError('This area cannot provide the requested number of distinct sampling locations.')
        selected = [int(np.argmin(np.sum((candidates - candidates.mean(axis=0)) ** 2, axis=1)))]
        for _ in range(1, int(number)):
            distances = cKDTree(candidates[selected]).query(candidates)[0]
            selected.append(int(distances.argmax()))
        samples = candidates[selected]
        tree = cKDTree(candidates)
        for _ in range(20):
            groups = cKDTree(samples).query(candidates)[1]
            centers = np.array([candidates[groups == i].mean(axis=0) if (groups == i).any() else samples[i]
                                for i in range(int(number))])
            _, nearest = tree.query(centers, k=int(number))
            nearest = np.asarray(nearest).reshape(int(number), int(number))
            used, selected = set(), []
            for choices in nearest:
                index = next(int(i) for i in choices if i not in used)
                selected.append(index); used.add(index)
            updated = candidates[selected]
            if np.array_equal(samples, updated):
                break
            samples = updated
        if any(not polygon.covers(Point(p)) for p in samples):
            raise ValueError('Unable to place every sample inside its assigned zone.')
        points.extend(samples)
        labels.extend([description] * len(samples))
        component_ids.extend([component] * len(samples))
    result = np.asarray(points)
    if len(result) != count or len(np.unique(result, axis=0)) != count:
        raise ValueError('Unable to produce the requested number of distinct sampling locations.')
    return result, labels, component_ids, allocations
