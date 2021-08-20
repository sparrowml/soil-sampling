import React from "react";
import {
  Editor,
  EditingMode,
  DrawPolygonMode,
  DrawPointMode,
} from "react-map-gl-draw";
import MapGL, { Source, Layer } from "react-map-gl";

import * as actions from "../actions";
import { store } from "../store";
import { getFeatureStyle, getEditHandleStyle } from "../styles";

const TOKEN =
  "pk.eyJ1IjoiamJlbmNvb2sxIiwiYSI6ImNrc2h6a3hkazBhd28ydm41MTA4MGw5ODIifQ.i9LnGAqi7LO478W227kNgw";
const MAP_HEIGHT = "600px";
const MAP_WIDTH = "600px";

function getCursor() {
  return "crosshair";
}

export default function Mapbox() {
  const { state, dispatch } = React.useContext(store);
  const [mode, setMode] = React.useState(new DrawPolygonMode());
  const [featureIndex, setFeatureIndex] = React.useState(null);
  const editorRef = React.useRef(null);

  const onSelect = React.useCallback(({ selectedFeatureIndex }) => {
    setFeatureIndex(selectedFeatureIndex);
  }, []);

  const onDelete = React.useCallback(() => {
    if (featureIndex !== null && featureIndex >= 0) {
      editorRef.current.deleteFeatures(featureIndex);
    }
  }, [featureIndex]);

  const updateFeatureState = () => {
    dispatch({
      type: actions.SET_FIELD_POLYGONS,
      value: editorRef.current
        .getFeatures()
        .filter((feature) => feature.geometry.type === "Polygon"),
    });
    dispatch({
      type: actions.SET_FIELD_POINTS,
      value: editorRef.current
        .getFeatures()
        .filter((feature) => feature.geometry.type === "Point"),
    });
  };

  let timeout;
  const onUpdate = React.useCallback(({ editType }) => {
    clearTimeout(timeout);
    timeout = setTimeout(updateFeatureState);
    if (editType === "addFeature") {
      setMode(new EditingMode());
    }
  }, []);

  const refreshPoints = async () => {
    if (editorRef.current === null) return;
    for (let i = 0; i < 10; i++) {
      const deleteIndices = editorRef.current
        .getFeatures()
        .map((feature, i) => (feature.geometry.type === "Point" ? i : null))
        .filter((i) => i !== null);
      if (deleteIndices.length === 0) {
        break;
      }
      await editorRef.current.deleteFeatures(deleteIndices);
    }
    editorRef.current.addFeatures(state.fieldPoints);
  };

  const clearFeatures = async () => {
    if (editorRef.current === null) return;
    for (let i = 0; i < 10; i++) {
      const indices = editorRef.current.getFeatures().map((_, i) => i);
      if (indices.length === 0) {
        break;
      }
      await editorRef.current.deleteFeatures(indices);
    }
    updateFeatureState();
  };

  const deleteFeature = async () => {
    if (editorRef.current === null) return;
    if (featureIndex !== null) {
      await editorRef.current.deleteFeatures(featureIndex);
      updateFeatureState();
    }
  };

  React.useEffect(() => {
    if (state.trigger === null) return;
    switch (state.trigger) {
      case "refreshPoints":
        refreshPoints();
        break;
      case "clearFeatures":
        clearFeatures();
        break;
      case "deleteFeature":
        deleteFeature();
        break;
      case "newPolygon":
        setMode(new DrawPolygonMode());
        break;
      case "newPoint":
        setMode(new DrawPointMode());
        break;
      default:
        throw new Error(`Unknown trigger: ${state.trigger}`);
    }
    dispatch(actions.setTrigger(null));
  }, [state.trigger]);

  return (
    <div id="map-container">
      <MapGL
        {...state.viewport}
        getCursor={getCursor}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        onViewportChange={(viewport) =>
          dispatch({ type: actions.SET_VIEWPORT, value: viewport })
        }
        mapboxApiAccessToken={TOKEN}
      >
        <Source
          type="geojson"
          data={{ type: "FeatureCollection", features: state.fieldMukeys }}
        >
          <Layer
            id="regions"
            type="line"
            paint={{
              "line-color": "#fec44f",
            }}
            layout={{
              visibility: "visible",
            }}
          />
        </Source>
        <Editor
          ref={editorRef}
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
