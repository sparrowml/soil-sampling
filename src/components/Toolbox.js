import * as React from "react";
import {
  DrawPolygonMode,
  DrawPointMode,
  DrawLineStringMode,
  EditingMode,
} from "react-map-gl-draw";
import styled from "styled-components";
import FileSaver from "file-saver";
import shpwrite from "shp-write";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Modal from "@material-ui/core/Modal";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import MUIButton from "@material-ui/core/Button";
import "boxicons";

import { store } from "../store";
import * as actions from "../actions";
import useStyles from "../styles";
import * as path from "../path";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const Tools = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 10px;
  right: 10px;
`;

const Button = styled.button`
  color: #fff;
  background: ${({ disabled, active }) =>
    disabled
      ? "rgb(224, 224, 224)"
      : active
      ? "rgb(0, 105, 217)"
      : "rgb(90, 98, 94)"};
  font-size: 1em;
  font-weight: 400;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  border: 1px solid transparent;
  border-radius: 0.25em;
  margin: 0.05em;
  padding: 0.1em 0.2em;
  :hover ${({ disabled }) =>
    disabled
      ? "{ background:rgb(224, 224, 224); }"
      : "{ cursor: pointer; background: rgb(128, 137, 133); }"}
  }
`;

const MODES = [
  { mode: "select", content: <Icon name="pointer" />, title: "Select" },
  { mode: "polygon", content: <Icon name="shape-polygon" />, title: "Polygon" },
  { mode: "point", content: <Icon name="map-pin" />, title: "Point" },
  { mode: "path", content: <Icon name="stats" />, title: "Path" },
];

function Icon(props) {
  return <box-icon color="currentColor" {...props} />;
}

export default function Toolbox() {
  const { state, dispatch } = React.useContext(store);
  const classes = useStyles();

  const [saveOpen, setSaveOpen] = React.useState(false);
  const [trashOpen, setTrashOpen] = React.useState(false);

  const [fileName, setFileName] = React.useState("");
  const [fileType, setFileType] = React.useState("csv");

  const savePoints = () => {
    const orderedPoints = path.orderedPoints(
      state.fieldPath,
      state.fieldPoints
    );
    if (fileType === "csv") {
      const output = path.toCsv(orderedPoints, state.mukeyNameMap);
      const blob = new Blob([output], { type: "text/csv;charset=utf-8;" });
      let safeFileName = fileName || "download.csv";
      safeFileName = safeFileName.endsWith(".csv")
        ? safeFileName
        : `${safeFileName}.csv`;
      FileSaver.saveAs(blob, safeFileName);
    } else if (fileType === "kml") {
      const output = path.toKml(orderedPoints, state.mukeyNameMap);
      const blob = new Blob([output], {
        type: "application/vnd.google-earth.kml+xml;charset=utf-8",
      });
      let safeFileName = fileName || "download.kml";
      safeFileName = safeFileName.endsWith(".kml")
        ? safeFileName
        : `${safeFileName}.kml`;
      FileSaver.saveAs(blob, safeFileName);
    } else if (fileType === "shp") {
      const output = path.toGeojson(orderedPoints, state.mukeyNameMap);
      shpwrite.download(output);
    }
    setSaveOpen(false);
  };

  const trashPoints = () => {
    dispatch(actions.setTrigger("clearEditor"));
    dispatch(actions.setFieldPolygons([]));
    dispatch(actions.setFieldPoints([]));
    dispatch(actions.setFieldMukeys([]));
    dispatch(actions.setFieldMukeyIds([]));
    dispatch(actions.setFieldPath([]));
    setTrashOpen(false);
  };

  const fileNameInput = () => {
    switch (fileType) {
      case "csv":
        return (
          <Grid item>
            <TextField
              value={fileName}
              placeholder="download.csv"
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
              placeholder="download.kml"
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

  const newClick = () => {
    switch (state.mode) {
      case "polygon":
        dispatch(actions.setMapboxMode(new DrawPolygonMode()));
        return;
      case "point":
        dispatch(actions.setMapboxMode(new DrawPointMode()));
        return;
      case "path":
        dispatch(actions.setMapboxMode(new DrawLineStringMode()));
        return;
      default:
        return;
    }
  };

  const editClick = () => {
    switch (state.mode) {
      case "polygon":
        dispatch(actions.setMapboxMode(new EditingMode()));
        return;
      case "point":
        dispatch(actions.setMapboxMode(new EditingMode()));
        return;
      case "path":
        dispatch(actions.setMapboxMode(new EditingMode()));
        return;
      default:
        return;
    }
  };

  const newActive = () => {
    return (
      state.mapboxMode instanceof DrawPolygonMode ||
      state.mapboxMode instanceof DrawPointMode ||
      state.mapboxMode instanceof DrawLineStringMode
    );
  };

  const editActive = () => state.mapboxMode instanceof EditingMode;

  return (
    <>
      <Tools>
        {MODES.map((modeConfig, i) => (
          <Button
            key={i}
            active={state.mode === modeConfig.mode}
            onClick={() => dispatch(actions.setMode(modeConfig.mode))}
            title={modeConfig.title}
          >
            {modeConfig.content}
          </Button>
        ))}

        <br />

        <Button onClick={newClick} title="New" active={newActive()}>
          <Icon name="plus" />
        </Button>

        <Button onClick={editClick} title="Edit" active={editActive()}>
          <Icon name="pencil" />
        </Button>

        <Button
          onClick={() => dispatch(actions.setTrigger("deleteFeature"))}
          title="Cut"
        >
          <Icon name="cut" />
        </Button>

        <br />

        <Button onClick={() => setSaveOpen(true)} title="Export">
          <Icon name="export" />
        </Button>
        <Button onClick={() => setTrashOpen(true)} title="Delete">
          <Icon name="trash" />
        </Button>
      </Tools>
      <Modal open={saveOpen} onClose={() => setSaveOpen(false)}>
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
              <MUIButton
                variant="contained"
                color="primary"
                className={classes.modalFormControl}
                onClick={savePoints}
              >
                Save
              </MUIButton>
            </Grid>
          </Grid>
        </div>
      </Modal>
      <Modal open={trashOpen} onClose={() => setTrashOpen(false)}>
        <div style={getModalStyle()} className={classes.modalPaper}>
          <h2 id="simple-modal-title">
            Are you sure you want to clear all features?
          </h2>
          <Grid container direction="row">
            <Grid item>
              <MUIButton
                variant="contained"
                color="secondary"
                className={classes.modalFormControl}
                onClick={trashPoints}
              >
                Clear All
              </MUIButton>
            </Grid>
            <Grid item>
              <MUIButton
                variant="contained"
                color="primary"
                className={classes.modalFormControl}
                onClick={() => setTrashOpen(false)}
              >
                Cancel
              </MUIButton>
            </Grid>
          </Grid>
        </div>
      </Modal>
    </>
  );
}
