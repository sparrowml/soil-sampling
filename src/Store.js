import React, {createContext, useReducer} from 'react';

const initialState = {name:null, lat:null, lng:null, layer1:false, layer2:false, layer3:false};
const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ( { children } ) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch(action.type) {
      case 'set name':
        return {...state, name:action.value};
      case 'set latitude': 
        return {...state, lat:action.value};
      case 'set longitude':
        return {...state, lng:action.value};
      case 'set layer1':        
        return {...state, layer1:action.value};
      case 'set layer2':
        return {...state, layer2:action.value};
      case 'set layer3':
        return {...state, layer3:action.value};
      default:
        throw new Error();
    };
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider }