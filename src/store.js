import React from "react";

import * as actions from "./actions";

const initialState = {
  algo: "uniform",
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
      case actions.SET_ALGO:
        return { ...state, algo: action.value };
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
