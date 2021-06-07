import ReactDOM from 'react-dom';
import React, { useState, useRef, useEffect, Component } from 'react';
//import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import "./App.css";

import Form from "./CustomForm";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Mapbox from "./Mapbox"


class App extends Component {
  render() {
    return (
      <main>
        <div class="background-image">
        
        <div className="Headerbox">
             <Header/>
        </div>

        <section>
          <Form/>
        </section>

        <div className="Mapbox">
            <Mapbox/>
        </div>
        
        </div>
      </main>
    );
  }
}

export default App;