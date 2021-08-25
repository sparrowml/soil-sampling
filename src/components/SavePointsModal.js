import React from "react";

import shpwrite from "shp-write";
import Modal from "@material-ui/core/Modal";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import FileSaver from "file-saver";

import * as path from "../path";
import { store } from "../store";
import useStyles from "../styles";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

export default function SavePointsModal() {
  const { state } = React.useContext(store);
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);
  const [fileName, setFileName] = React.useState("");
  const [fileType, setFileType] = React.useState("csv");

  const savePoints = () => {
    const orderedPoints = path.orderedPoints(
      state.fieldPath,
      state.fieldPoints
    );
    if (fileType === "csv") {
      const output = path.toCsv(orderedPoints);
      const blob = new Blob([output], { type: "text/csv;charset=utf-8;" });
      FileSaver.saveAs(blob, fileName);
    } else if (fileType === "kml") {
      const output = path.toKml(orderedPoints);
      const blob = new Blob([output], {
        type: "application/vnd.google-earth.kml+xml;charset=utf-8",
      });
      FileSaver.saveAs(blob, fileName);
    } else if (fileType === "shp") {
      const output = path.toGeojson(orderedPoints);
      shpwrite.download(output);
    }
  };

  const fileNameInput = () => {
    switch (fileType) {
      case "csv":
        return (
          <Grid item>
            <TextField
              value={fileName}
              placeholder="filename.csv"
              helperText="File name"
              className={classes.modalFormControl}
              onChange={(e) => setFileName(e.target.value)}
            />
          </Grid>
        );
      case "kml":
        return (
          <Grid item>
            <TextField
              value={fileName}
              placeholder="filename.kml"
              helperText="File name"
              className={classes.modalFormControl}
              onChange={(e) => setFileName(e.target.value)}
            />
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        className={classes.formControl}
        onClick={() => setOpen(true)}
      >
        Save Points
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div style={getModalStyle()} className={classes.modalPaper}>
          <h2 id="simple-modal-title">Save Points</h2>
          <Grid item>
            <FormControl className={classes.modalFormControl}>
              <Select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
              >
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="kml">KML</MenuItem>
                <MenuItem value="shp">SHP</MenuItem>
              </Select>
              <FormHelperText>File Type</FormHelperText>
            </FormControl>
          </Grid>
          <Grid container direction="column">
            {fileNameInput()}
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                className={classes.modalFormControl}
                onClick={savePoints}
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </div>
      </Modal>
    </>
  );
}
