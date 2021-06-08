import ReactDOM from 'react-dom';
import React, { useState, useRef, useEffect, Component } from 'react';
//import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

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
          <Grid container direction="column" justify="center" alignItems="flex-start" spacing={3}>
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
          </Grid>
        </Container>
      </main>
    );
  }
}

export default App;