"""Request-local, bounded CSV parsing for clustering."""
import csv
import io
import json
import re

import numpy as np
import pandas as pd
from werkzeug.exceptions import BadRequest

MAX_CSV_ROWS = 10000
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
MAX_GRID_CELLS = 100000


def clustering_input(request):
    if request.mimetype == 'multipart/form-data':
        if set(request.files) != {'pointDataCsv'} or len(request.files.getlist('pointDataCsv')) != 1:
            raise ValueError('Supply exactly one CSV file in the pointDataCsv field.')
        if 'options' in request.form:
            if set(request.form) != {'options'}:
                raise ValueError('Use either an options JSON field or individual form fields, not both.')
            body = json.loads(request.form['options'])
        else:
            body = {}
            for key in ('polygon', 'nPoints', 'includeElevation'):
                if key in request.form:
                    body[key] = json.loads(request.form[key])
        if not isinstance(body, dict):
            raise ValueError('Options must be a JSON object.')
        if 'pointDataShapefile' in body or 'pointDataShapefile' in request.form:
            raise ValueError('Choose CSV upload or JSON shapefile URL, not both.')
        point_data = read_csv(request.files['pointDataCsv'].stream)
    elif request.is_json:
        try:
            body = request.get_json()
        except BadRequest as exc:
            raise ValueError('Invalid JSON request.') from exc
        point_data = None
    else:
        raise ValueError('Use application/json or multipart/form-data.')
    if not isinstance(body, dict):
        raise ValueError('Request must be a JSON object.')
    n_points = body.get('nPoints', 10)
    if isinstance(n_points, bool) or not isinstance(n_points, int) or not 1 <= n_points <= 200:
        raise ValueError('nPoints must be an integer between 1 and 200.')
    if not isinstance(body.get('includeElevation', False), bool):
        raise ValueError('includeElevation must be true or false.')
    config = body.get('clusteringOptions', {})
    if not isinstance(config, dict) or set(config) - {'smoothingCells', 'minPatchAreaM2'}:
        raise ValueError('clusteringOptions supports only smoothingCells and minPatchAreaM2.')
    smooth = config.get('smoothingCells', 3)
    minimum = config.get('minPatchAreaM2', 5000.)
    if isinstance(smooth, bool) or not isinstance(smooth, int) or smooth not in (1, 3, 5):
        raise ValueError('smoothingCells must be 1, 3, or 5.')
    if isinstance(minimum, bool) or not isinstance(minimum, (int, float)) or not 0 <= minimum <= 10000 or not np.isfinite(minimum):
        raise ValueError('minPatchAreaM2 must be between 0 and 10000.')
    if point_data is not None:
        resolve_elevation(body, point_data)
    return body, point_data


def resolve_elevation(body, point_data):
    """Uploaded elevation takes precedence; never silently discard a CSV feature."""
    elevation_names = {'elev', 'elevation', 'elev relative', 'relative elev', 'elevation relative',
                       'relative elevation', 'elev absolute', 'absolute elev', 'elevation absolute', 'absolute elevation'}
    uploaded = [name for name in point_data.columns
                if re.sub(r'[\s_-]+', ' ', name.strip().lower()) in elevation_names]
    metadata = point_data.attrs.setdefault('input_diagnostics', {'warnings': []})
    requested = body.get('includeElevation', False)
    if uploaded and requested:
        body['includeElevation'] = False
        metadata['warnings'].append('Uploaded elevation is used for clustering; automatic elevation was not added a second time.')
    metadata['elevation'] = {'requested_automatic': requested, 'used_automatic': body.get('includeElevation', False),
                             'uploaded_columns': uploaded}
    if len(point_data.columns) - 2 + body.get('includeElevation', False) > 3:
        raise ValueError('A maximum of 3 clustering columns, including elevation, is supported. '
                         'The CSV already has 3 measurement columns and includeElevation=true adds a fourth. '
                         'Set includeElevation=false to use all CSV measurements, or remove a CSV measurement column.')


def read_csv(stream):
    raw = stream.read(MAX_UPLOAD_BYTES + 1)
    if len(raw) > MAX_UPLOAD_BYTES:
        raise ValueError('CSV must be at most 5 MiB.')
    try:
        reader = csv.reader(io.StringIO(raw.decode('utf-8-sig')), strict=True)
        header = [name.strip() for name in next(reader, [])]
        if not header:
            raise ValueError("CSV is empty. Add a header row with lon, lat, and 1 to 3 numeric measurement columns.")
        if len(header) > 1000:
            raise ValueError('CSV exceeds the 1000 column limit, including empty columns.')
        aliases = {'lat': 'lat', 'latitude': 'lat', 'lon': 'lon', 'long': 'lon', 'longitude': 'lon'}
        header = [aliases.get(name.lower(), name) for name in header]
        raw_rows = []
        empty_rows = 0
        input_rows = 0
        for index, row in enumerate(reader, 2):
            if index - 1 > MAX_CSV_ROWS:
                raise ValueError('CSV exceeds the 10000 row limit.')
            input_rows += 1
            if not row or all(not value.strip() for value in row):
                empty_rows += 1
                continue
            if len(row) != len(header):
                raise ValueError(f'CSV row {index} has the wrong number of columns.')
            raw_rows.append((index, row))
        # Spreadsheet exports often retain unused columns. Drop only columns
        # with no values anywhere; never infer that a populated column is unused.
        kept = [column for column, name in enumerate(header)
                if name in ('lat', 'lon') or not raw_rows
                or any(row[column].strip() for _, row in raw_rows)]
        kept_set = set(kept)
        ignored = [name or f'Column {column + 1}' for column, name in enumerate(header) if column not in kept_set]
        header = [header[column] for column in kept]
        if len(header) != len(set(header)) or any(not name.strip() for name in header):
            raise ValueError('CSV column names must be nonempty and unique.')
        missing = [name for name in ('lat', 'lon') if name not in header]
        if missing:
            raise ValueError(f"CSV is missing required column(s): {', '.join(missing)}. "
                             "Use lat/latitude and lon/long/longitude in the first row; "
                             "column order does not matter. Example: lon,lat,yield.")
        if not 3 <= len(header) <= 5:
            raise ValueError('CSV requires lat, lon, and 1 to 3 numeric clustering columns.')
        rows = []
        missing_rows = 0
        for index, raw_row in raw_rows:
            row = [raw_row[column] for column in kept]
            # Preserve the established explicit-NaN invalid-observation rule.
            if any(value.strip().lower() in ('nan', '+nan', '-nan') for value in row):
                missing_rows += 1
                continue
            missing = [not value.strip() or value.strip().lower() in ('nan', '+nan', '-nan') for value in row]
            try:
                values = [float(value) if not absent else None for value, absent in zip(row, missing)]
            except ValueError as exc:
                raise ValueError(f'CSV row {index} has a nonnumeric value. Use numeric measurements; rows with blank or NaN measurements are skipped.') from exc
            if any(value is not None and not np.isfinite(value) for value in values):
                raise ValueError(f'CSV row {index} contains a non-finite value.')
            if any(missing):
                missing_rows += 1
                continue
            rows.append(values)
    except (UnicodeError, csv.Error) as exc:
        raise ValueError('CSV must be valid UTF-8 comma-separated text.') from exc
    if len(rows) < 3:
        raise ValueError(f'CSV requires at least 3 usable data rows. Read {input_rows}; retained {len(rows)}; skipped {empty_rows} empty and {missing_rows} incomplete rows.')
    frame = pd.DataFrame(rows, columns=header)
    if not frame.lat.between(-80, 84).all() or not frame.lon.between(-180, 180).all():
        raise ValueError('CSV coordinates are out of range. Use WGS84 decimal degrees: lat (latitude) -80 to 84 and lon (longitude) -180 to 180. Check whether the lat and lon column headers are swapped.')
    if len(frame.drop_duplicates(['lat', 'lon'])) < 3:
        raise ValueError('CSV requires at least 3 distinct point locations.')
    if len(frame.drop(columns=['lat', 'lon']).drop_duplicates()) < 3:
        raise ValueError('CSV requires at least 3 distinct clustering value combinations.')
    # Repeated coordinates can make nearest-neighbor ties arbitrary. Consistent
    # duplicates carry no new information; conflicting observations need review.
    unique = frame.drop_duplicates()
    if unique.duplicated(['lat', 'lon']).any():
        raise ValueError('CSV has conflicting measurements at the same coordinate. Combine or correct duplicate locations before uploading.')
    duplicate_rows = len(frame) - len(unique)
    frame = unique.reset_index(drop=True)
    warnings = []
    if ignored:
        warnings.append(f'Ignored {len(ignored)} completely empty column(s).')
    if empty_rows or missing_rows:
        warnings.append(f'Skipped {empty_rows} empty and {missing_rows} incomplete row(s); retained {len(frame)} observations.')
    if duplicate_rows:
        warnings.append(f'Collapsed {duplicate_rows} identical duplicate observation(s).')
    frame.attrs['input_diagnostics'] = {'rows_read': input_rows, 'rows_retained': len(frame),
        'rows_empty': empty_rows, 'rows_incomplete': missing_rows, 'rows_duplicate': duplicate_rows,
        'ignored_empty_column_count': len(ignored), 'ignored_empty_columns': [name[:100] for name in ignored[:20]], 'warnings': warnings}
    return frame
