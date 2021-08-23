import React from "react";

import { Grid, Paper, InputLabel } from "@material-ui/core";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";

import Mapbox from "./Mapbox";
import UniformForm from "./UniformForm";
import VoronoiForm from "./VoronoiForm";
import Instructions from "./Instructions";

import * as api from "../api";
import { store } from "../store";
import * as actions from "../actions";
import useStyles from "../styles";

const pointMap = (point) => ({
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: point,
  },
  properties: {},
});

const polygonMap = (polygon) => ({
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [polygon],
  },
  properties: {},
});

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

  const generatePoints = async (event) => {
    event.preventDefault();
    dispatch({ type: actions.SET_FIELD_POINTS, value: [] });
    dispatch({ type: actions.SET_FIELD_MUKEYS, value: [] });
    dispatch(actions.setTrigger("refreshPoints"));
    const fieldPoints = [];
    const fieldMukeys = [];
    for (const feature of state.fieldPolygons) {
      const polygon = feature.geometry.coordinates[0];
      let response;
      if (state.algo === "uniform") {
        response = await api.uniformSample(polygon, state.sampleArea);
        if (response.points) fieldPoints.push(...response.points.map(pointMap));
      } else if (state.algo === "voronoi") {
        response = await api.voronoiSample(polygon, state.nPoints);
        if (response.points) fieldPoints.push(...response.points.map(pointMap));
        if (response.regions)
          fieldMukeys.push(...response.regions.map(polygonMap));
      }
      if (response.error) {
        alert(response.error);
        return;
      }
    }
    dispatch({ type: actions.SET_FIELD_POINTS, value: fieldPoints });
    dispatch({ type: actions.SET_FIELD_MUKEYS, value: fieldMukeys });
    dispatch(actions.setTrigger("refreshPoints"));
  };

  return (
    <div className={classes.form}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Mapbox />
        </Grid>

        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <Grid container direction="row">
              <Grid item>
                <Button
                  className={classes.gridButtons}
                  variant="contained"
                  color={"primary"}
                  onClick={() => dispatch(actions.setTrigger("deleteFeature"))}
                >
                  Delete Selection
                </Button>
              </Grid>
              <Grid item>
                <Button
                  className={classes.gridButtons}
                  variant="contained"
                  color={"primary"}
                  onClick={() => dispatch(actions.setTrigger("clearFeatures"))}
                >
                  Clear Features
                </Button>
              </Grid>
              <Grid item>
                <Button
                  className={classes.gridButtons}
                  variant="contained"
                  color={"primary"}
                  onClick={() => dispatch(actions.setTrigger("newPolygon"))}
                >
                  New Polygon
                </Button>
              </Grid>
              <Grid item>
                <Button
                  className={classes.gridButtons}
                  variant="contained"
                  color={"primary"}
                  onClick={() => dispatch(actions.setTrigger("newPoint"))}
                >
                  New Point
                </Button>
              </Grid>
              <Grid item>
                <Button
                  className={classes.gridButtons}
                  variant="contained"
                  color={state.fieldPathMode ? "secondary" : "primary"}
                  onClick={() => dispatch(actions.toggleFieldPathMode())}
                >
                  Path Mode
                </Button>
              </Grid>
            </Grid>
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
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.formControl}
                  onClick={generatePoints}
                >
                  Generate Points
                </Button>
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
