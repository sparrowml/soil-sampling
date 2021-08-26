export const SET_MODE = "SET_MODE";
export const setMode = (mode) => ({ type: SET_MODE, mode });

export const SET_MAPBOX_MODE = "SET_MAPBOX_MODE";
export const setMapboxMode = (mode) => ({ type: SET_MAPBOX_MODE, mode });

export const SET_ALGO = "SET_ALGO";
export const SET_SAMPLE_AREA = "SET_SAMPLE_AREA";
export const SET_N_POINTS = "SET_N_POINTS";
export const SET_FIELD_POLYGONS = "SET_FIELD_POLYGONS";
export const setFieldPolygons = (fieldPolygons) => ({
  type: SET_FIELD_POLYGONS,
  fieldPolygons,
});

export const SET_FIELD_POINTS = "SET_FIELD_POINTS";
export const setFieldPoints = (fieldPoints) => ({
  type: SET_FIELD_POINTS,
  fieldPoints,
});

export const SET_FIELD_MUKEYS = "SET_FIELD_MUKEYS";
export const setFieldMukeys = (fieldMukeys) => ({
  type: SET_FIELD_MUKEYS,
  fieldMukeys,
});

export const SET_FIELD_MUKEY_IDS = "SET_FIELD_MUKEY_IDS";
export const setFieldMukeyIds = (fieldMukeyIds) => ({
  type: SET_FIELD_MUKEY_IDS,
  fieldMukeyIds,
});

export const SET_MUKEY_NAME_MAP = "SET_MUKEY_NAME_MAP";
export const setMukeyNameMap = (mukeyNameMap) => ({
  type: SET_MUKEY_NAME_MAP,
  mukeyNameMap,
});

export const SET_FIELD_PATH = "SET_FIELD_PATH";
export const setFieldPath = (fieldPath) => ({
  type: SET_FIELD_PATH,
  fieldPath,
});

export const SET_VIEWPORT = "SET_VIEWPORT";
export const setViewport = (viewport) => ({ type: SET_VIEWPORT, viewport });

export const SET_LONGITUDE = "SET_LONGITUDE";
export const setLongitude = (longitude) => ({ type: SET_LONGITUDE, longitude });

export const SET_LATITUDE = "SET_LATITUDE";
export const setLatitude = (latitude) => ({ type: SET_LATITUDE, latitude });

export const DELETE_FIELD_PATH = "DELETE_FIELD_PATH";
export const deleteFieldPath = () => ({ type: DELETE_FIELD_PATH });

export const TOGGLE_FIELD_PATH_MODE = "TOGGLE_FIELD_PATH_MODE";
export const toggleFieldPathMode = () => ({ type: TOGGLE_FIELD_PATH_MODE });

export const ADD_FIELD_PATH_POINT = "ADD_FIELD_PATH_POINT";
export const addFieldPathPoint = (point) => ({
  type: ADD_FIELD_PATH_POINT,
  point,
});

export const SET_TRIGGER = "SET_TRIGGER";
export const setTrigger = (trigger) => ({
  type: SET_TRIGGER,
  trigger,
});
