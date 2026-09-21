"""Request-local, bounded CSV parsing for clustering."""
import csv
import io
import json

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
    if point_data is not None and len(point_data.columns) - 2 + body.get('includeElevation', False) > 3:
        raise ValueError('A maximum of 3 clustering columns, including elevation, is supported.')
    return body, point_data


def read_csv(stream):
    raw = stream.read(MAX_UPLOAD_BYTES + 1)
    if len(raw) > MAX_UPLOAD_BYTES:
        raise ValueError('CSV must be at most 5 MiB.')
    try:
        reader = csv.reader(io.StringIO(raw.decode('utf-8-sig')), strict=True)
        header = next(reader, [])
        if len(header) != len(set(header)) or any(not name.strip() for name in header):
            raise ValueError('CSV column names must be nonempty and unique.')
        if 'lat' not in header or 'lon' not in header or not 3 <= len(header) <= 5:
            raise ValueError('CSV requires lat, lon, and 1 to 3 numeric clustering columns.')
        rows = []
        for index, row in enumerate(reader, 2):
            if len(rows) >= MAX_CSV_ROWS:
                raise ValueError('CSV exceeds the 10000 row limit.')
            if len(row) != len(header):
                raise ValueError(f'CSV row {index} has the wrong number of columns.')
            try:
                values = [float(value) for value in row]
            except ValueError as exc:
                raise ValueError(f'CSV row {index} must contain only numeric values, with no blanks.') from exc
            if not np.isfinite(values).all():
                raise ValueError(f'CSV row {index} contains a non-finite value.')
            rows.append(values)
    except (UnicodeError, csv.Error) as exc:
        raise ValueError('CSV must be valid UTF-8 comma-separated text.') from exc
    if len(rows) < 3:
        raise ValueError('CSV requires at least 3 data rows.')
    frame = pd.DataFrame(rows, columns=header)
    if not frame.lat.between(-80, 84).all() or not frame.lon.between(-180, 180).all():
        raise ValueError('CSV coordinates must be WGS84: latitude -80 to 84, longitude -180 to 180 (UTM coverage).')
    if len(frame.drop_duplicates(['lat', 'lon'])) < 3:
        raise ValueError('CSV requires at least 3 distinct point locations.')
    if len(frame.drop(columns=['lat', 'lon']).drop_duplicates()) < 3:
        raise ValueError('CSV requires at least 3 distinct clustering value combinations.')
    return frame
