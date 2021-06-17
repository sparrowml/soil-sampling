import ReactDOM from 'react-dom';
import React, { useState, useRef, useEffect, Component } from 'react';
//import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';

import "./App.css";

import Form from "./CustomForm";
import Header from "./Components/Header";
import Footer from "./Components/Footer";


class App extends Component {
  render() {
    return (
      <main>
      <CssBaseline />
      <Container fixed>
          <div>
          
          <div className="Headerbox">
              <Header/>
          </div>

          <section>
            <Form/>
          </section>

          {/* <div className="Mapbox">
              <Mapbox/>
          </div> */}
          
          </div>
        </Container>
      </main>
    );
  }
}

export default App;