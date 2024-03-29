import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import ReactGA from "react-ga4";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { StateProvider, store } from "./store";

import "./index.css";

const app = (
  <StateProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </StateProvider>
);

ReactDOM.render(app, document.getElementById("root"));
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
ReactGA.initialize("G-7FVL8WBSQF");
