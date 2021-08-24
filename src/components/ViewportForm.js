import React from "react";

import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";

import { store } from "../store";
import * as actions from "../actions";

export default function ViewportForm({ className }) {
  const { state, dispatch } = React.useContext(store);
  const [longitude, setLongitude] = React.useState(state.viewport.longitude);
  const [lonError, setLonError] = React.useState("");
  const [latitude, setLatitude] = React.useState(state.viewport.latitude);
  const [latError, setLatError] = React.useState("");

  let lonTimeout;
  const onLonChange = (event) => {
    setLongitude(event.target.value);
    clearTimeout(lonTimeout);
    const value = parseFloat(event.target.value);
    if (isNaN(value) || value < -180 || value > 180) {
      setLonError("Longitude must be in the range [-180, 180]");
      return;
    }
    setLonError("");
    lonTimeout = setTimeout(() => dispatch(actions.setLongitude(value)), 1000);
  };

  let latTimeout;
  const onLatChange = (event) => {
    setLatitude(event.target.value);
    clearTimeout(latTimeout);
    const value = parseFloat(event.target.value);
    if (isNaN(value) || value < -90 || value > 90) {
      setLatError("Latitude must be in the range [-90, 90]");
      return;
    }
    setLatError("");
    latTimeout = setTimeout(() => dispatch(actions.setLatitude(value)), 1000);
  };

  return (
    <Grid container direction="row">
      <Grid item>
        <FormControl className={className}>
          <TextField
            error={lonError !== ""}
            value={longitude}
            onChange={onLonChange}
            helperText={lonError || "Longitude"}
          />
        </FormControl>
      </Grid>
      <Grid item>
        <FormControl className={className}>
          <TextField
            error={latError !== ""}
            value={latitude}
            onChange={onLatChange}
            helperText={latError || "Latitude"}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}
