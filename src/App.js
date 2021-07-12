import React from "react";

import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";

import Form from "./components/CustomForm";
import Header from "./components/Header";
import Navbar from "./components/Navbar";

import "./App.css";

class App extends React.Component {
  render() {
    return (
      <main>
        <Navbar />
        <CssBaseline />
        <Container fixed>
          <div>
            <div className="Headerbox">
              <Header />
            </div>
            <section>
              <Form />
            </section>
          </div>
        </Container>
      </main>
    );
  }
}

export default App;
