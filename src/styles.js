import { RENDER_STATE } from "react-map-gl-draw";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  form: {
    flexGrow: 1,
    marginTop: theme.spacing(10),
  },
  gridButtons: {
    margin: theme.spacing(2),
    minWidth: 100,
  },
  formControl: {
    margin: theme.spacing(4),
    minWidth: 200,
  },
  modalFormControl: {
    margin: theme.spacing(2),
    minWidth: 250,
  },
  modalPaper: {
    position: "absolute",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4, 3),
  },
  paper: {
    color: theme.palette.text.secondary,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
}));

export function getEditHandleStyle({ feature, state }) {
  switch (state) {
    case RENDER_STATE.SELECTED:
    case RENDER_STATE.HOVERED:
    case RENDER_STATE.UNCOMMITTED:
      return {
        fill: "rgb(251, 176, 59)",
        fillOpacity: 1,
        stroke: "rgb(255, 255, 255)",
        strokeWidth: 2,
        r: 7,
      };

    default:
      return {
        fill: "rgb(251, 176, 59)",
        fillOpacity: 1,
        stroke: "rgb(255, 255, 255)",
        strokeWidth: 2,
        r: 5,
      };
  }
}

export function getFeatureStyle({ feature, index, state }) {
  if (feature.geometry.type === "Point") {
    switch (state) {
      case RENDER_STATE.SELECTED:
      case RENDER_STATE.HOVERED:
      case RENDER_STATE.UNCOMMITTED:
      case RENDER_STATE.CLOSING:
        return {
          fill: "#2ca25f",
          fillOpacity: 0.85,
          strokeDasharray: "4,2",
          r: 9,
        };
      default:
        return {
          fill: "white",
          fillOpacity: 0.85,
          r: 3,
        };
    }
  } else {
    switch (state) {
      case RENDER_STATE.SELECTED:
      case RENDER_STATE.UNCOMMITTED:
      case RENDER_STATE.CLOSING:
        return {
          stroke: "rgb(251, 176, 59)",
          strokeWidth: 2,
          fill: "rgb(251, 176, 59)",
          fillOpacity: 0.3,
          strokeDasharray: "4,2",
        };
      case RENDER_STATE.HOVERED:
        return {
          stroke: "rgb(251, 176, 59)",
          strokeWidth: 2,
          fill: "rgb(60, 178, 208)",
          fillOpacity: 0.1,
          strokeDasharray: "4,2",
        };
      default:
        return {
          stroke: "rgb(60, 178, 208)",
          strokeWidth: 2,
          fill: "rgb(60, 178, 208)",
          fillOpacity: 0.1,
        };
    }
  }
}

export default useStyles;
