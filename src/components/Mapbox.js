import React from "react";
import { Editor, EditingMode, DrawPolygonMode } from "react-map-gl-draw";
import MapGL from "react-map-gl";

import * as actions from "../actions";
import { store } from "../store";
import { getFeatureStyle, getEditHandleStyle } from "../styles";

const TOKEN =
  "pk.eyJ1IjoiamJlbmNvb2sxIiwiYSI6ImNrc2h6a3hkazBhd28ydm41MTA4MGw5ODIifQ.i9LnGAqi7LO478W227kNgw";
const MAP_HEIGHT = "600px";
const MAP_WIDTH = "600px";

export default function Mapbox() {
  const { state, dispatch } = React.useContext(store);
  const [features, setFeatures] = React.useState({
    type: "FeatureCollection",
    features: [],
  });
  const [mode, setMode] = React.useState(new DrawPolygonMode());
  const [modeConfig, setModeConfig] = React.useState({});
  const [selectedFeatureIndex, setSelectedFeatureIndex] = React.useState(null);

  const onSelect = React.useCallback((options) => {
    setSelectedFeatureIndex(options && options.selectedFeatureIndex);
  }, []);

  const onUpdate = React.useCallback(({ editType }) => {
    if (editType === "addFeature") {
      setMode(new EditingMode());
    }
  }, []);

  React.useEffect(() => {
    switch (state.mode) {
      case "drawPolygon":
        setMode(new DrawPolygonMode());
        break;
      case "editing":
        setMode(new EditingMode());
        break;
      default:
        break;
    }
  }, [state.mode]);

  return (
    <div id="map-container">
      <MapGL
        {...state.viewport}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        onViewportChange={(viewport) =>
          dispatch({ type: actions.SET_VIEWPORT, value: viewport })
        }
        mapboxApiAccessToken={TOKEN}
      >
        <Editor
          // to make the lines/vertices easier to interact with
          clickRadius={12}
          mode={mode}
          onSelect={onSelect}
          onUpdate={onUpdate}
          editHandleShape={"circle"}
          featureStyle={getFeatureStyle}
          editHandleStyle={getEditHandleStyle}
        />
      </MapGL>
    </div>
  );
}
