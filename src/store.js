import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { DrawPolygonMode, EditingMode } from "react-map-gl-draw";

import * as actions from "./actions";

const initialState = {
  aoi: null,
  fieldPolygons: [],
  fieldRegions: [],
  fieldRegionIds: [],
  mapUnitRequest: null,
  regionNameMap: {},
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.SET_AOI:
      return { ...state, aoi: action.aoi };
    case actions.SET_FIELD_POLYGONS:
      return { ...state, fieldPolygons: action.fieldPolygons };
    case actions.SET_REGION_NAME_MAP:
      return { ...state, regionNameMap: action.regionNameMap };
    case actions.SET_MAP_UNIT_REQUEST:
      return { ...state, mapUnitRequest: action.mapUnitRequest };
    case actions.SET_FIELD_REGIONS:
      return { ...state, fieldRegions: action.fieldRegions };
    case actions.SET_FIELD_REGION_IDS:
      return { ...state, fieldRegionIds: action.fieldRegionIds };
    default:
      return state;
  }
};

export const store = configureStore({ reducer });

// Legacy store. Move data to redux over time.
const legacyInitialState = {
  mode: "polygon",
  mapboxMode: new DrawPolygonMode(),
  algo: "uniform",
  trigger: null,
  sampleArea: "5",
  triangleOffset: false,
  nPoints: 50,
  inputData: null,
  loading: false,
  fieldPoints: [],
  fieldPathMode: false,
  fieldPath: [],
  viewport: {
    latitude: 41.16510772,
    longitude: -96.47332242,
    zoom: 13.81594170898739,
    bearing: 0,
    pitch: 0,
  },
};
export const legacyStore = React.createContext(legacyInitialState);
const { Provider } = legacyStore;

export const StateProvider = ({ children }) => {
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
      case actions.SET_INPUT_DATA:
        newState = { ...state, inputData: action.inputData };
        break;
      case actions.SET_FIELD_POINTS:
        newState = { ...state, fieldPoints: action.fieldPoints };
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
    return newState;
  }, legacyInitialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};
