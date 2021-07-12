import React from "react";

import * as actions from "./actions";

const initialState = {
  name: null,
  latitude: 40.8,
  longitude: -96.7,
  layer1: false,
  layer2: false,
  layer3: false,
};
const store = React.createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer((state, action) => {
    switch (action.type) {
      case actions.SET_NAME:
        return { ...state, name: action.value };
      case actions.SET_LATITUDE:
        return { ...state, latitude: action.value };
      case actions.SET_LONGITUDE:
        return { ...state, longitude: action.value };
      case actions.SET_LAYER1:
        return { ...state, layer1: action.value };
      case actions.SET_LAYER2:
        return { ...state, layer2: action.value };
      case actions.SET_LAYER3:
        return { ...state, layer3: action.value };
      default:
        throw new Error();
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
