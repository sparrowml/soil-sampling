import React from "react";

import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";

import useStyles from "../styles";
import { store } from "../store";
import * as actions from "../actions";

export default function UniformForm({ className }) {
  const classes = useStyles();
  const { state, dispatch } = React.useContext(store);

  const onSampleAreaChange = (event) => {
    event.preventDefault();
    dispatch(actions.setSampleArea(event.target.value));
  };
  const onTriangleOffsetChange = (event) => {
    event.preventDefault();
    dispatch(actions.toggleTriangleOffset());
  };

  return (
    <Grid container>
      <Grid item>
        <FormControl className={className}>
          <Select value={state.sampleArea} onChange={onSampleAreaChange}>
            <MenuItem value="1">1 Acre</MenuItem>
            <MenuItem value="2.5">2.5 Acres</MenuItem>
            <MenuItem value="5">5 Acres</MenuItem>
          </Select>
          <FormHelperText>Sample Area</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item>
        <FormControl className={className}>
          <FormControlLabel
            className={classes.checkboxLabel}
            control={
              <Checkbox
                checked={state.triangleOffset}
                onClick={onTriangleOffsetChange}
                name="triangleOffset"
                color="primary"
              />
            }
            label="Triangle Offset"
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}
