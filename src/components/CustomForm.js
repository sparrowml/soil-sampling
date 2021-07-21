import React from "react";

import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import { makeStyles } from "@material-ui/core/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormHelperText from "@material-ui/core/FormHelperText";

import Mapbox from "./Mapbox";

import { store } from "../store";
import * as actions from "../actions";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  inlineField: {
    marginRight: "20px",
  },
}));

function Form() {
  const { dispatch } = React.useContext(store);
  const classes = useStyles();

  const handleChanges = (type, event) => {
    dispatch({ type, value: event.target.checked });
  };

  const setFloat = (type, value) => {
    // Validate that value before dispatching it
    const floatValue = parseFloat(value);
    if (!isNaN(floatValue)) {
      if (
        type === actions.SET_LONGITUDE &&
        floatValue >= -180 &&
        floatValue <= 180
      ) {
        // Set Longitude
        dispatch({ type, value: floatValue });
      } else if (
        type === actions.SET_LATITUDE &&
        floatValue >= -90 &&
        floatValue <= 90
      ) {
        dispatch({ type, value: floatValue });
      }
    }
  };

  return (
    <div className={classes.root}>
      <form>
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="flex-start"
          spacing={3}
        >
          <Grid item xs={12}>
            <TextField
              id="name"
              label="Name"
              onChange={(e) =>
                dispatch({ type: actions.SET_NAME, value: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Mapbox />
          </Grid>

          <Grid item xs={12}>
            <FormLabel component="legend">Define Field Center</FormLabel>
            <TextField
              id="longitude"
              label="Longitude"
              onChange={(e) => setFloat(actions.SET_LONGITUDE, e.target.value)}
              className={classes.inlineField}
              placeholder="Longitude"
            />
            <TextField
              id="latitude"
              label="Latitude"
              onChange={(e) => setFloat(actions.SET_LATITUDE, e.target.value)}
              className={classes.inlineField}
              placeholder="Latitude"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Pick Layers</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={(e) => handleChanges(actions.SET_POLARIS, e)}
                      name="PolarisService"
                    />
                  }
                  label="PolarisService (currently the test layer - click me!!!)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={(e) => handleChanges(actions.SET_DEMS, e)}
                      name="DEMService"
                    />
                  }
                  label="DEMService (Elevation)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={(e) => handleChanges(actions.SET_SSURGO, e)}
                      name="SSURGO"
                    />
                  }
                  label="SSURGO"
                />
              </FormGroup>
              <FormHelperText>
                We can add more or less layers to choose from on the fly.
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </form>
    </div>
  );
}

export default Form;
