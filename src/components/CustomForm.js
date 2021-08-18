import React from "react";

import { Grid, Paper, InputLabel } from "@material-ui/core";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";

import Mapbox from "./Mapbox";
import UniformForm from "./UniformForm";
import VoronoiForm from "./VoronoiForm";
import Instructions from "./Instructions";

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
  const classes = useStyles();

  const { state, dispatch } = React.useContext(store);
  const setAlgo = (event) => {
    dispatch({ type: actions.SET_ALGO, value: event.target.value });
  };

  const subForm = () => {
    switch (state.algo) {
      case "uniform":
        return <UniformForm className={classes.formControl} />;
      case "voronoi":
        return <VoronoiForm className={classes.formControl} />;
      case "clustering":
        alert("This algorithm is not currently implemented.");
        dispatch({ type: actions.SET_ALGO, value: "uniform" });
        return null;
      default:
        return null;
    }
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Mapbox />
        </Grid>

        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <Grid container direction="column">
              <Grid item>
                <FormControl className={classes.formControl}>
                  <InputLabel>Algorithm</InputLabel>
                  <Select value={state.algo} onChange={setAlgo}>
                    <MenuItem value="uniform">Uniform</MenuItem>
                    <MenuItem value="voronoi">Soil Zones</MenuItem>
                    <MenuItem value="clustering">Clustering</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>{subForm()}</Grid>
            </Grid>
            <Instructions />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Form;
