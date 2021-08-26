import React from "react";
import { DrawPolygonMode, EditingMode } from "react-map-gl-draw";

import * as actions from "./actions";

const initialState = {
  mode: "polygon",
  mapboxMode: new DrawPolygonMode(),
  algo: "voronoi",
  trigger: null,
  sampleArea: "5",
  nPoints: 15,
  fieldPolygons: [],
  fieldPoints: [],
  fieldMukeys: [],
  fieldMukeyIds: [],
  mukeyNameMap: {},
  fieldPathMode: false,
  fieldPath: [],
  viewport: {
    latitude: 40.7,
    longitude: -96.5,
    zoom: 13.81594170898739,
    bearing: 0,
    pitch: 0,
  },
};
const store = React.createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer((state, action) => {
    switch (action.type) {
      case actions.SET_MODE:
        return {
          ...state,
          mode: action.mode,
          mapboxMode: new EditingMode(),
        };
      case actions.SET_MAPBOX_MODE:
        return { ...state, mapboxMode: action.mode };
      case actions.SET_ALGO:
        return { ...state, algo: action.value };
      case actions.SET_SAMPLE_AREA:
        return { ...state, sampleArea: action.value };
      case actions.SET_N_POINTS:
        return { ...state, nPoints: action.value };
      case actions.SET_FIELD_POLYGONS:
        return { ...state, fieldPolygons: action.fieldPolygons };
      case actions.SET_FIELD_POINTS:
        return { ...state, fieldPoints: action.fieldPoints };
      case actions.SET_FIELD_MUKEYS:
        return { ...state, fieldMukeys: action.fieldMukeys };
      case actions.SET_FIELD_MUKEY_IDS:
        return { ...state, fieldMukeyIds: action.fieldMukeyIds };
      case actions.SET_MUKEY_NAME_MAP:
        return { ...state, mukeyNameMap: action.mukeyNameMap };
      case actions.SET_FIELD_PATH:
        return { ...state, fieldPath: action.fieldPath };
      case actions.SET_VIEWPORT:
        return { ...state, viewport: action.viewport };
      case actions.SET_LONGITUDE:
        return {
          ...state,
          viewport: { ...state.viewport, longitude: action.longitude },
        };
      case actions.SET_LATITUDE:
        return {
          ...state,
          viewport: { ...state.viewport, latitude: action.latitude },
        };
      case actions.SET_TRIGGER:
        return { ...state, trigger: action.trigger };
      case actions.ADD_FIELD_PATH_POINT:
        return { ...state, fieldPath: [...state.fieldPath, action.point] };
      case actions.TOGGLE_FIELD_PATH_MODE:
        if (state.fieldPathMode)
          return { ...state, fieldPathMode: !state.fieldPathMode };
        else
          return {
            ...state,
            fieldPathMode: !state.fieldPathMode,
            fieldPath: [],
          };
      default:
        throw new Error();
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
