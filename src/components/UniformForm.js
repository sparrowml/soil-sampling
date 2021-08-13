import React from "react";

import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";

import { store } from "../store";
import * as actions from "../actions";

export default function UniformForm({ className }) {
  const { state, dispatch } = React.useContext(store);
  const setSampleArea = (event) => {
    dispatch({ type: actions.SET_SAMPLE_AREA, value: event.target.value });
  };

  return (
    <FormControl className={className}>
      <Select value={state.sampleArea} onChange={setSampleArea}>
        <MenuItem value="1">1 Acre</MenuItem>
        <MenuItem value="2.5">2.5 Acres</MenuItem>
        <MenuItem value="5">5 Acres</MenuItem>
      </Select>
      <FormHelperText>Sample Area</FormHelperText>
    </FormControl>
  );
}
