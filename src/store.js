import React from "react";

import * as actions from "./actions";

const initialState = {
  algo: "voronoi",
  sampleArea: "1",
  nPoints: 50,
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
      case actions.SET_SAMPLE_AREA:
        return { ...state, sampleArea: action.value };
      case actions.SET_N_POINTS:
        return { ...state, nPoints: action.value };
      case actions.DELETE_DRAWN_POLYGON:
        return {
          ...state,
          drawnPolygons: [
            ...state.drawnPolygons.slice(0, action.value),
            ...state.drawnPolygons.slice(action.value + 1),
          ],
        };
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
