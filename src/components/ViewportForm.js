import React from "react";
import { useSelector } from "react-redux";

import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";

import { legacyStore } from "../store";
import * as actions from "../actions";

export default function ViewportForm({ className }) {
  const { state, dispatch } = React.useContext(legacyStore);
  const aoi = useSelector((state) => state.aoi);
  const [longitude, setLongitude] = React.useState(
    `${state.viewport.longitude}`
  );
  const [lonError, setLonError] = React.useState("");
  const [latitude, setLatitude] = React.useState(`${state.viewport.latitude}`);
  const [latError, setLatError] = React.useState("");

  const onLonChange = (event) => {
    setLongitude(event.target.value);
    const value = parseFloat(event.target.value);
    if (isNaN(value) || value < -180 || value > 180) {
      setLonError("Longitude must be in the range [-180, 180]");
      return;
    }
    setLonError("");
    dispatch(actions.setLongitude(value));
  };

  const onLatChange = (event) => {
    setLatitude(event.target.value);
    const value = parseFloat(event.target.value);
    if (isNaN(value) || value < -90 || value > 90) {
      setLatError("Latitude must be in the range [-90, 90]");
      return;
    }
    setLatError("");
    dispatch(actions.setLatitude(value));
  };

  return (
    <Grid container direction="column">
      <Grid container direction="row">
        <Grid item>
          <FormControl className={className}>
            <TextField
              error={lonError !== ""}
              value={
                parseFloat(longitude) === state.viewport.longitude
                  ? longitude
                  : state.viewport.longitude
              }
              onChange={onLonChange}
              helperText={lonError || "Longitude"}
            />
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl className={className}>
            <TextField
              error={latError !== ""}
              value={
                parseFloat(latitude) === state.viewport.latitude
                  ? latitude
                  : state.viewport.latitude
              }
              onChange={onLatChange}
              helperText={latError || "Latitude"}
            />
          </FormControl>
        </Grid>
      </Grid>
      <Grid item>
        <FormControl className={className}>
          <TextField value={aoi || ""} helperText="Area of Interest (acres)" />
        </FormControl>
      </Grid>
    </Grid>
  );
}
