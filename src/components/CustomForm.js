import React from "react";

import { Grid, Paper, InputLabel } from "@material-ui/core";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";

import Mapbox from "./Mapbox";

import { store } from "../store";
import * as actions from "../actions";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: theme.spacing(10),
  },
  paper: {
    color: theme.palette.text.secondary,
  },
  formControl: {
    margin: theme.spacing(4),
    minWidth: 200,
  },
}));

function Form() {
  const { state, dispatch } = React.useContext(store);
  const classes = useStyles();

  const setAlgo = (event) => {
    dispatch({ type: actions.SET_ALGO, value: event.target.value });
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Mapbox />
        </Grid>

        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <FormControl className={classes.formControl}>
              <InputLabel>Algorithm</InputLabel>
              <Select value={state.algo} onChange={setAlgo}>
                <MenuItem value="uniform">Uniform</MenuItem>
                <MenuItem value="voronoi">Voronoi</MenuItem>
                <MenuItem value="clustering">Clustering</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Form;
