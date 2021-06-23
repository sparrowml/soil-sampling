import ReactDOM from 'react-dom';
import React, { useState, useRef, useEffect, Component } from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';

import "./App.css";

import Form from "./CustomForm";
import Header from "./Components/Header";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";


class App extends Component {
  render() {
    return (
      <main>
        <Navbar />
          <CssBaseline />
            <Container fixed>
              <div>
                <div className="Headerbox">
                  <Header/>
              </div>

            <section>
              <Form/>
            </section>

          </div>
        </Container>

    </main>
    );
  };
};

export default App;