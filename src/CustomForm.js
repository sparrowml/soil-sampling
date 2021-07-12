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

import { store } from "./Store.js";
import Mapbox from "./Mapbox";

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
                dispatch({ type: "set name", value: e.target.value })
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
              onChange={(e) =>
                dispatch({ type: "set latitude", value: e.target.value })
              }
              className={classes.inlineField}
              placeholder="-96.7"
            />
            <TextField
              id="latitude"
              label="Latitude"
              onChange={(e) =>
                dispatch({ type: "set longitude", value: e.target.value })
              }
              className={classes.inlineField}
              placeholder="40.8"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Pick Layers</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={(e) => handleChanges("set layer1", e)}
                      name="layer1"
                    />
                  }
                  label="layer1"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={(e) => handleChanges("set layer2", e)}
                      name="layer2"
                    />
                  }
                  label="layer2"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={(e) => handleChanges("set layer3", e)}
                      name="layer3"
                    />
                  }
                  label="layer3"
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
