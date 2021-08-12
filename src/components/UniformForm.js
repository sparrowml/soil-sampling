import React from "react";

import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import { store } from "../store";
import * as actions from "../actions";

export default function UniformForm({ className }) {
  const { state, dispatch } = React.useContext(store);
  const setSampleArea = (event) => {
    dispatch({ type: actions.SET_SAMPLE_AREA, value: event.target.value });
  };

  return (
    <FormControl className={className}>
      <InputLabel>Sample Area</InputLabel>
      <Select value={state.sampleArea} onChange={setSampleArea}>
        <MenuItem value="1">1 Acre</MenuItem>
        <MenuItem value="2.5">2.5 Acres</MenuItem>
        <MenuItem value="5">5 Acres</MenuItem>
      </Select>
    </FormControl>
  );
}
