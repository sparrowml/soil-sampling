import React from "react";

import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";

import Form from "./CustomForm";
import Header from "./Components/Header";
import Navbar from "./Components/Navbar";

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
