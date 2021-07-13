import React from "react";

import MapGL from "react-map-gl";

import {
  RENDER_STATE,
  DrawPolygonMode,
  EditingMode,
  Editor,
} from "react-map-gl-draw";

import CustomMarker from "./CustomMarker";

import { store } from "../store";
import * as actions from "../actions";

const TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN_PK;
const MAP_HEIGHT = "600px";
const MAP_WIDTH = "600px";

function getEditHandleStyle({ state }) {
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

function getFeatureStyle({ state }) {
  switch (state) {
    case RENDER_STATE.SELECTED:
    case RENDER_STATE.HOVERED:
    case RENDER_STATE.UNCOMMITTED:
    case RENDER_STATE.CLOSING:
      return {
        stroke: "rgb(251, 176, 59)",
        strokeWidth: 2,
        fill: "rgb(251, 176, 59)",
        fillOpacity: 0.3,
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

export default function Mapbox() {
  const { state, dispatch } = React.useContext(store);

  const [mode, setMode] = React.useState(null);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = React.useState(null);
  const editorRef = React.useRef(null);

  const onDrawMode = React.useCallback((event) => {
    event.preventDefault();
    setMode(new DrawPolygonMode());
  }, []);

  const onSelect = React.useCallback((options) => {
    setSelectedFeatureIndex(options && options.selectedFeatureIndex);
  }, []);

  const onDelete = React.useCallback(
    (event) => {
      event.preventDefault();
      if (selectedFeatureIndex !== null && selectedFeatureIndex >= 0) {
        editorRef.current.deleteFeatures(selectedFeatureIndex);
        dispatch({
          type: actions.SET_DRAWN_POLYGONS,
          value: editorRef.current.getFeatures(),
        });
      }
    },
    [selectedFeatureIndex, dispatch]
  );

  const onUpdate = React.useCallback(
    ({ editType }) => {
      if (editType === "addFeature") {
        dispatch({
          type: actions.SET_DRAWN_POLYGONS,
          value: editorRef.current.getFeatures(),
        });
        setMode(new EditingMode());
      }
    },
    [dispatch]
  );

  const drawTools = (
    <div className="mapboxgl-ctrl-top-left">
      <div className="mapboxgl-ctrl-group mapboxgl-ctrl">
        <button
          className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_polygon"
          title="Polygon tool (p)"
          onClick={onDrawMode}
        />
        <button
          className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash"
          title="Delete"
          onClick={onDelete}
        />
      </div>
    </div>
  );

  return (
    <>
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
          ref={editorRef}
          style={{ width: "100%", height: "100%" }}
          clickRadius={12}
          mode={mode}
          onSelect={onSelect}
          onUpdate={onUpdate}
          editHandleShape={"circle"}
          featureStyle={getFeatureStyle}
          editHandleStyle={getEditHandleStyle}
        />
        {drawTools}
        <CustomMarker longitude={state.longitude} latitude={state.latitude} />
      </MapGL>
    </>
  );
}
