import React, { useState } from "react";
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

import Mapbox from "./Mapbox";


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  inlineField: {
    marginRight: '20px',
  }
}));


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
          </Grid>
        </form>
    </div>
  );  
}

export default Form;
