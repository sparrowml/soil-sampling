import React from "react";

import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";

import useStyles from "../styles";
import { legacyStore } from "../store";
import * as actions from "../actions";

export default function ClusteringForm() {
  const classes = useStyles();

  const { state, dispatch } = React.useContext(legacyStore);
  const [nPoints, setNPoints] = React.useState(state.nPoints);
  const [errorMessage, setErrorMessage] = React.useState("");

  let timeout;
  const onChange = (event) => {
    clearTimeout(timeout);
    let value = event.target.value;
    setNPoints(value);
    value = parseFloat(value);
    if (isNaN(value) || value < 4 || value % 1 !== 0 || value > 99) {
      setErrorMessage("Value must be a positive integer between 4 and 99");
      return;
    }
    setErrorMessage("");
    timeout = setTimeout(
      () => dispatch({ type: actions.SET_N_POINTS, value: Math.round(value) }),
      1000
    );
  };

  return (
    <Grid container>
      <Grid item>
        <FormControl className={classes.formControl}>
          <TextField
            error={errorMessage !== ""}
            value={nPoints}
            onChange={onChange}
            helperText={errorMessage || "Maximum number of points"}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}
