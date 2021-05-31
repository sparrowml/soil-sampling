//import ReactDOM from 'react-dom';
import React, { useState, useRef, useEffect, Component } from 'react';

//import Mapbox from './Mapbox';
import LoginForm from "./CustomForm"


class App extends Component {
  render() {
    return (
      <main>
        <section>
          <LoginForm />
        </section>
      </main>
    );
  }
}

export default App;