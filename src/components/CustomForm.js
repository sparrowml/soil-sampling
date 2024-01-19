import React from "react";
import { useSelector } from "react-redux";

import { Grid, Paper, InputLabel, Typography } from "@material-ui/core";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import Mapbox from "./Mapbox";
import ClusteringForm from "./ClusteringForm";
import UniformForm from "./UniformForm";
import VoronoiForm from "./VoronoiForm";
import Instructions from "./Instructions";
import ViewportForm from "./ViewportForm";
import SubmitActions from "./SubmitActions";

import { legacyStore } from "../store";
import * as actions from "../actions";
import useStyles from "../styles";

function Form() {
  const classes = useStyles();

  const { state, dispatch } = React.useContext(legacyStore);
  const regionNameMap = useSelector((state) => state.regionNameMap);
  const regionNames = Array.from(new Set(Object.values(regionNameMap))).sort(
    (a, b) => a.localeCompare(b)
  );

  const setAlgo = (event) => {
    dispatch({ type: actions.SET_ALGO, value: event.target.value });
  };

  const subForm = () => {
    switch (state.algo) {
      case "uniform":
        return <UniformForm className={classes.formControl} />;
      case "voronoi":
        return <VoronoiForm className={classes.formControl} />;
      case "clustering":
        return <ClusteringForm className={classes.formControl} />;
      default:
        return null;
    }
  };

  return (
    <div className={classes.form}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Mapbox />
        </Grid>

        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <ViewportForm className={classes.formControl} />
            <Grid item>
              <FormControl className={classes.formControl}>
                <Paper>
                  <TableContainer className={classes.table}>
                    <Table size="small" aria-label="a dense table">
                      <TableHead className={classes.tableHeader}>
                        <TableRow>
                          <TableCell>
                            <Typography variant="subtitle2">
                              Soil Map Units in AOI
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {regionNames.map((name) => (
                          <TableRow key={name}>
                            <TableCell component="th" scope="row">
                              {name}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </FormControl>
            </Grid>
            <Grid container direction="column">
              <Grid item>
                <FormControl className={classes.formControl}>
                  <InputLabel>Algorithm</InputLabel>
                  <Select value={state.algo} onChange={setAlgo}>
                    <MenuItem value="uniform">Uniform</MenuItem>
                    <MenuItem value="voronoi">Soil Map Unit</MenuItem>
                    <MenuItem value="cema221scss">
                      Soil Carbon Stock Sampling (CEMA 221)
                    </MenuItem>
                    <MenuItem value="cema221cs">
                      Citizen Science (CEMA 221)
                    </MenuItem>
                    <MenuItem value="clustering">Clustering</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>{subForm()}</Grid>
              <Grid item>
                <SubmitActions className={classes.formControl} />
              </Grid>
            </Grid>
            <Instructions />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Form;
