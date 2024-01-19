import React from "react";

import { Grid, Paper, InputLabel } from "@material-ui/core";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import Mapbox from "./Mapbox";
import ClusteringForm from "./ClusteringForm";
import UniformForm from "./UniformForm";
import VoronoiForm from "./VoronoiForm";
import Instructions from "./Instructions";
import ViewportForm from "./ViewportForm";
import SubmitActions from "./SubmitActions";

import { legacyStore } from "../store";
import * as actions from "../actions";
import useStyles from "../styles";

function Form() {
  const classes = useStyles();

  const { state, dispatch } = React.useContext(legacyStore);
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
        return <ClusteringForm className={classes.formControl} />;
      default:
        return null;
    }
  };

  return (
    <div className={classes.form}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Mapbox />
        </Grid>

        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <ViewportForm className={classes.formControl} />
            <Grid container direction="column">
              <Grid item>
                <FormControl className={classes.formControl}>
                  <InputLabel>Algorithm</InputLabel>
                  <Select value={state.algo} onChange={setAlgo}>
                    <MenuItem value="uniform">Uniform</MenuItem>
                    <MenuItem value="voronoi">
                      Soil Map Unit (Standard)
                    </MenuItem>
                    <MenuItem value="cema221">
                      Soil Map Unit (CEMA 221)
                    </MenuItem>
                    <MenuItem value="cema212">
                      Soil Map Unit (CEMA 212)
                    </MenuItem>
                    <MenuItem value="clustering">Clustering</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>{subForm()}</Grid>
              <Grid item>
                <SubmitActions className={classes.formControl} />
              </Grid>
            </Grid>
            <Instructions />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Form;
