import React from "react";

import * as actions from "./actions";

const initialState = {
  algo: "voronoi",
  refreshPoints: 0,
  deleteFeature: 0,
  sampleArea: "1",
  nPoints: 50,
  fieldPolygons: [],
  fieldPoints: [],
  fieldMukeys: [],
  viewport: {
    latitude: 40.745530243920015,
    longitude: -96.50904174854016,
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
      case actions.SET_ALGO:
        return { ...state, algo: action.value };
      case actions.SET_SAMPLE_AREA:
        return { ...state, sampleArea: action.value };
      case actions.SET_N_POINTS:
        return { ...state, nPoints: action.value };
      case actions.SET_FIELD_POLYGONS:
        return { ...state, fieldPolygons: action.value };
      case actions.SET_FIELD_POINTS:
        return { ...state, fieldPoints: action.value };
      case actions.SET_FIELD_MUKEYS:
        return { ...state, fieldMukeys: action.value };
      case actions.SET_VIEWPORT:
        return { ...state, viewport: action.value };
      case actions.REFRESH_POINTS:
        return { ...state, refreshPoints: state.refreshPoints + 1 };
      case actions.DELETE_FEATURE:
        return { ...state, deleteFeature: state.deleteFeature + 1 };
      default:
        throw new Error();
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
