import React from "react";

import * as actions from "./actions";

const initialState = {
  name: null,
  latitude: 40.8,
  longitude: -96.7,
  polaris: false,
  demservice: false,
  layer3: false,
  drawnPolygons: [],
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
      case actions.SET_NAME:
        return { ...state, name: action.value };
      case actions.SET_LATITUDE:
        const latitude = action.value;
        return {
          ...state,
          latitude,
          viewport: { ...state.viewport, latitude },
        };
      case actions.SET_LONGITUDE:
        const longitude = action.value;
        return {
          ...state,
          longitude,
          viewport: { ...state.viewport, longitude },
        };
      case actions.SET_POLARIS:
        return { ...state, polaris: action.value };
      case actions.SET_DEMS:
        return { ...state, dems: action.value };
      case actions.SET_SSURGO:
        return { ...state, ssurgo: action.value };
      case actions.SET_DRAWN_POLYGONS:
        return { ...state, drawnPolygons: action.value };
      case actions.SET_VIEWPORT:
        return { ...state, viewport: action.value };
      default:
        throw new Error();
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
