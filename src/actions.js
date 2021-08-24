export const SET_ALGO = "SET_ALGO";
export const SET_SAMPLE_AREA = "SET_SAMPLE_AREA";
export const SET_N_POINTS = "SET_N_POINTS";
export const SET_FIELD_POLYGONS = "SET_FIELD_POLYGONS";
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

export const SET_FIELD_PATH = "SET_FIELD_PATH";
export const setFieldPath = (fieldPath) => ({
  type: SET_FIELD_PATH,
  fieldPath,
});

export const SET_VIEWPORT = "SET_VIEWPORT";
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
