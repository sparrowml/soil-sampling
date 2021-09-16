import React from "react";
import { DrawPolygonMode, EditingMode } from "react-map-gl-draw";

import * as actions from "./actions";

const initialState = {
  mode: "polygon",
  mapboxMode: new DrawPolygonMode(),
  algo: "clustering",
  trigger: null,
  sampleArea: "5",
  triangleOffset: false,
  nPoints: 15,
  loading: false,
  fieldPolygons: [],
  fieldPoints: [],
  fieldRegions: [],
  fieldRegionIds: [],
  regionNameMap: {},
  fieldPathMode: false,
  fieldPath: [],
  viewport: {
    latitude: 46.27276278,
    longitude: -97.89774976,
    zoom: 13.81594170898739,
    bearing: 0,
    pitch: 0,
  },
};
const store = React.createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer((state, action) => {
    let newState;
    switch (action.type) {
      case actions.SET_MODE:
        newState = {
          ...state,
          mode: action.mode,
          mapboxMode: action.mode !== "select" ? new EditingMode() : null,
        };
        break;
      case actions.SET_LOADING:
        newState = { ...state, loading: action.loading };
        break;
      case actions.SET_MAPBOX_MODE:
        newState = { ...state, mapboxMode: action.mode };
        break;
      case actions.SET_ALGO:
        newState = { ...state, algo: action.value };
        break;
      case actions.SET_SAMPLE_AREA:
        newState = { ...state, sampleArea: action.sampleArea };
        break;
      case actions.TOGGLE_TRIANGLE_OFFSET:
        newState = { ...state, triangleOffset: !state.triangleOffset };
        break;
      case actions.SET_N_POINTS:
        newState = { ...state, nPoints: action.value };
        break;
      case actions.SET_FIELD_POLYGONS:
        newState = { ...state, fieldPolygons: action.fieldPolygons };
        break;
      case actions.SET_FIELD_POINTS:
        newState = { ...state, fieldPoints: action.fieldPoints };
        break;
      case actions.SET_FIELD_REGIONS:
        newState = { ...state, fieldRegions: action.fieldRegions };
        break;
      case actions.SET_FIELD_REGION_IDS:
        newState = { ...state, fieldRegionIds: action.fieldRegionIds };
        break;
      case actions.SET_REGION_NAME_MAP:
        newState = { ...state, regionNameMap: action.regionNameMap };
        break;
      case actions.SET_FIELD_PATH:
        newState = { ...state, fieldPath: action.fieldPath };
        break;
      case actions.SET_VIEWPORT:
        newState = { ...state, viewport: action.viewport };
        break;
      case actions.SET_LONGITUDE:
        newState = {
          ...state,
          viewport: { ...state.viewport, longitude: action.longitude },
        };
        break;
      case actions.SET_LATITUDE:
        newState = {
          ...state,
          viewport: { ...state.viewport, latitude: action.latitude },
        };
        break;
      case actions.SET_TRIGGER:
        newState = { ...state, trigger: action.trigger };
        break;
      case actions.ADD_FIELD_PATH_POINT:
        newState = { ...state, fieldPath: [...state.fieldPath, action.point] };
        break;
      case actions.TOGGLE_FIELD_PATH_MODE:
        if (state.fieldPathMode)
          newState = { ...state, fieldPathMode: !state.fieldPathMode };
        else
          newState = {
            ...state,
            fieldPathMode: !state.fieldPathMode,
            fieldPath: [],
          };
        break;
      default:
        throw new Error();
    }
    console.log(JSON.stringify(newState));
    return newState;
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
