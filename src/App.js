import React from "react";

import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";

import Form from "./components/CustomForm";
import Navbar from "./components/Navbar";

import useStyles from "./styles";
import "./App.css";

export default function App() {
  const classes = useStyles();
  return (
    <main className={classes.root}>
      <Navbar />
      <CssBaseline />
      <Container className={classes.content} fixed>
        <div>
          <section>
            <Form />
          </section>
        </div>
      </Container>
    </main>
  );
}
