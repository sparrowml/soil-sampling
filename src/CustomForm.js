import React, { useState } from "react";

import { createMuiTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Checkbox from "@material-ui/core/Checkbox";
import { makeStyles } from '@material-ui/core/styles';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormHelperText from "@material-ui/core/FormHelperText";

import Mapbox from "./Mapbox";


const useStyles = createMuiTheme({
  "palette":
  {"common":
      {"black":"#000","white":"#fff"},
      "background":{"paper":"rgba(255, 255, 255, 1)","default":"rgba(201, 231, 240, 1)"},
      "primary":{"light":"rgba(48, 161, 62, 0.49)","main":"rgba(48, 161, 62, 1)","dark":"rgba(7, 64, 14, 1)","contrastText":"#fff"},
      "secondary":{"light":"rgba(50, 82, 185, 0.6)","main":"rgba(50, 82, 185, 1)","dark":"rgba(13, 5, 107, 1)","contrastText":"#fff"},
      "error":{"light":"#e57373","main":"#f44336","dark":"#d32f2f","contrastText":"#fff"},
      "text":{"primary":"rgba(0, 0, 0, 0.87)","secondary":"rgba(0, 0, 0, 0.54)","disabled":"rgba(0, 0, 0, 0.38)","hint":"rgba(0, 0, 0, 0.38)"}
}

});

function Form() {
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const nameSetter = event => {
    const value = event.target.value;
    setName(value);
    console.log(name);
  }

  const classes = useStyles();

  const [checked, setChecked] = React.useState(true);

  const handleCheckmarks = (event) => {
    setChecked(event.target.checked);
  };

  const [layers, setLayers] = React.useState({
    layer1: true,
    layer2: false,
    layer3: false
  });

  const { layer1, layer2, layer3 } = layers;

  const handleChanges = (event) => {
    setLayers({ ...layers, [event.target.name]: event.target.checked });
  };


  return (
    <div className={classes.root}>
        <form>
          <Grid container direction="column" justify="center" alignItems="flex-start" spacing={3}>
            <Grid item xs={12}>
              <TextField
                id="name"
                label="Name"
                onChange={nameSetter}
              />
              </Grid>

            <Grid item xs={12}>
              <Mapbox />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="longitude"
                label="Longitude"
                onChange={e => setLongitude(e.target.value)}
                className={classes.inlineField}
              />
              <TextField
                id="latitude"
                label="Latitude"
                onChange={e => setLatitude(e.target.value)}
                className={classes.inlineField}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Pick Layers</FormLabel>
                <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                  checked={layer1}
                  onChange={handleChanges}
                  name="layer1"
                  />
                }
              label="layer1"
              />
              <FormControlLabel
                control={
                  <Checkbox
                  checked={layer2}
                  onChange={handleChanges}
                  name="layer2"
                  />
                }
              label="layer2"
              />
              <FormControlLabel
                control={
                  <Checkbox
                  checked={layer3}
                  onChange={handleChanges}
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
