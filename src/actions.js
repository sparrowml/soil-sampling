import getArea from "./area";

export const SET_MODE = "SET_MODE";
export const setMode = (mode) => ({ type: SET_MODE, mode });

export const SET_MAPBOX_MODE = "SET_MAPBOX_MODE";
export const setMapboxMode = (mode) => ({ type: SET_MAPBOX_MODE, mode });

export const SET_ALGO = "SET_ALGO";
export const SET_SAMPLE_AREA = "SET_SAMPLE_AREA";
export const setSampleArea = (sampleArea) => ({
  type: SET_SAMPLE_AREA,
  sampleArea,
});

export const TOGGLE_TRIANGLE_OFFSET = "TOGGLE_TRIANGLE_OFFSET";
export const toggleTriangleOffset = (triangleOffset) => ({
  type: TOGGLE_TRIANGLE_OFFSET,
  triangleOffset,
});

export const SET_AOI = "SET_AOI";
export const setAoi = (aoi) => ({ type: SET_AOI, aoi });

export const SET_N_POINTS = "SET_N_POINTS";
export const SET_FIELD_POLYGONS = "SET_FIELD_POLYGONS";
export const setFieldPolygons = (fieldPolygons) => ({
  type: SET_FIELD_POLYGONS,
  fieldPolygons,
});

export const setFieldPolygonsThunk = (fieldPolygons) => async (dispatch) => {
  let aoi = 0;
  for (const feature of fieldPolygons) {
    const polygon = feature.geometry.coordinates[0];
    aoi += getArea(polygon);
  }
  aoi *= 0.000247105;
  aoi = Math.round(aoi * 100) / 100;
  if (aoi === 0) {
    aoi = null;
  }
  dispatch(setAoi(aoi));
  dispatch(setFieldPolygons(fieldPolygons));
};

export const SET_INPUT_DATA = "SET_INPUT_DATA";
export const setInputData = (inputData) => ({
  type: SET_INPUT_DATA,
  inputData,
});

export const SET_FIELD_POINTS = "SET_FIELD_POINTS";
export const setFieldPoints = (fieldPoints) => ({
  type: SET_FIELD_POINTS,
  fieldPoints,
});

export const SET_FIELD_REGIONS = "SET_FIELD_REGIONS";
export const setFieldRegions = (fieldRegions) => ({
  type: SET_FIELD_REGIONS,
  fieldRegions,
});

export const SET_FIELD_REGION_IDS = "SET_FIELD_REGION_IDS";
export const setFieldRegionIds = (fieldRegionIds) => ({
  type: SET_FIELD_REGION_IDS,
  fieldRegionIds,
});

export const SET_REGION_NAME_MAP = "SET_REGION_NAME_MAP";
export const setRegionNameMap = (regionNameMap) => ({
  type: SET_REGION_NAME_MAP,
  regionNameMap,
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

export const SET_LOADING = "SET_LOADING";
export const setLoading = (loading) => ({ type: SET_LOADING, loading });
