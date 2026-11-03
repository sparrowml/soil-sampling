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
        header = [name.strip() for name in next(reader, [])]
        if not header:
            raise ValueError("CSV is empty. Add a header row with lon, lat, and 1 to 3 numeric measurement columns.")
        if len(header) != len(set(header)) or any(not name.strip() for name in header):
            raise ValueError('CSV column names must be nonempty and unique.')
        missing = [name for name in ('lat', 'lon') if name not in header]
        if missing:
            raise ValueError(f"CSV is missing required column(s): {', '.join(missing)}. "
                             "Use exactly lat for latitude and lon for longitude in the first row; "
                             "column order does not matter. Example: lon,lat,yield.")
        if not 3 <= len(header) <= 5:
            raise ValueError('CSV requires lat, lon, and 1 to 3 numeric clustering columns.')
        rows = []
        for index, row in enumerate(reader, 2):
            if index - 1 > MAX_CSV_ROWS:
                raise ValueError('CSV exceeds the 10000 row limit.')
            if not row or all(not value.strip() for value in row):
                continue
            if len(row) != len(header):
                raise ValueError(f'CSV row {index} has the wrong number of columns.')
            # A NaN in any column invalidates the entire observation.
            if any(value.strip().lower() in ('nan', '+nan', '-nan') for value in row):
                continue
            try:
                values = [float(value) for value in row]
            except ValueError as exc:
                raise ValueError(f'CSV row {index} has a blank or nonnumeric value. Use numbers in every column, or NaN to skip the row.') from exc
            if not np.isfinite(values).all():
                raise ValueError(f'CSV row {index} contains a non-finite value.')
            rows.append(values)
    except (UnicodeError, csv.Error) as exc:
        raise ValueError('CSV must be valid UTF-8 comma-separated text.') from exc
    if len(rows) < 3:
        raise ValueError('CSV requires at least 3 usable data rows after ignoring NaN and empty rows.')
    frame = pd.DataFrame(rows, columns=header)
    if not frame.lat.between(-80, 84).all() or not frame.lon.between(-180, 180).all():
        raise ValueError('CSV coordinates are out of range. Use WGS84 decimal degrees: lat (latitude) -80 to 84 and lon (longitude) -180 to 180. Check whether the lat and lon column headers are swapped.')
    if len(frame.drop_duplicates(['lat', 'lon'])) < 3:
        raise ValueError('CSV requires at least 3 distinct point locations.')
    if len(frame.drop(columns=['lat', 'lon']).drop_duplicates()) < 3:
        raise ValueError('CSV requires at least 3 distinct clustering value combinations.')
    return frame
