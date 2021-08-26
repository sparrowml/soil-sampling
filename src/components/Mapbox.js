import React from "react";
import {
  Editor,
  EditingMode,
  DrawPolygonMode,
  DrawPointMode,
} from "react-map-gl-draw";
import MapGL, { Source, Layer } from "react-map-gl";

import Display from "./Display";
import Toolbox from "./Toolbox";
import * as actions from "../actions";
import { store } from "../store";
import { getFeatureStyle, getEditHandleStyle } from "../styles";

const TOKEN =
  "pk.eyJ1IjoiamJlbmNvb2sxIiwiYSI6ImNrc2h6a3hkazBhd28ydm41MTA4MGw5ODIifQ.i9LnGAqi7LO478W227kNgw";
const MAP_HEIGHT = "600px";
const MAP_WIDTH = "600px";

function getCursor(mode, mapboxMode) {
  if (
    mapboxMode instanceof DrawPolygonMode ||
    mapboxMode instanceof DrawPointMode ||
    mode === "path"
  )
    return "crosshair";
  return "default";
}

export default function Mapbox() {
  const { state, dispatch } = React.useContext(store);
  const [featureIndex, setFeatureIndex] = React.useState(null);
  const editorRef = React.useRef(null);

  const [cursorLocation, setCursorLocation] = React.useState([-200, -200]);

  const editorRefToState = React.useCallback(async () => {
    if (editorRef.current === null) return;
    const features = await editorRef.current.getFeatures();
    // Send polygons to state
    const polygons = features.filter(
      (feature) => feature.geometry.type === "Polygon"
    );
    if (polygons.length > 0) dispatch(actions.setFieldPolygons(polygons));
    // Send points to state
    const points = features.filter(
      (feature) => feature.geometry.type === "Point"
    );
    if (points.length > 0) dispatch(actions.setFieldPoints(points));
    // Send lines to state
    const lines = features
      .filter((feature) => feature.geometry.type === "LineString")
      .map((feature) => feature.geometry.coordinates);
    if (lines.length > 0)
      dispatch(actions.setFieldPath(lines[0].concat(...lines.slice(1))));
  }, [dispatch]);

  const clearEditorRef = React.useCallback(async () => {
    if (editorRef.current === null) return;
    for (let i = 0; i < 10; i++) {
      const indices = editorRef.current.getFeatures().map((_, i) => i);
      if (indices.length === 0) {
        break;
      }
      await editorRef.current.deleteFeatures(indices);
    }
  }, []);

  // On switch modes
  React.useEffect(() => {
    const switchModes = async () => {
      if (editorRef.current === null) return;
      await editorRefToState();
      await clearEditorRef();
      switch (state.mode) {
        case "polygon":
          editorRef.current.addFeatures(state.fieldPolygons);
          dispatch(actions.setFieldPolygons([]));
          break;
        case "point":
          editorRef.current.addFeatures(state.fieldPoints);
          dispatch(actions.setFieldPoints([]));
          break;
        case "path":
          editorRef.current.addFeatures([
            {
              type: "Feature",
              geometry: { type: "LineString", coordinates: state.fieldPath },
              properties: {},
            },
          ]);
          dispatch(actions.setFieldPath([]));
          break;
        default:
          break;
      }
    };
    switchModes();
    // eslint-disable-next-line
  }, [dispatch, state.mode, editorRefToState, clearEditorRef]);

  const onSelect = React.useCallback(({ selectedFeatureIndex }) => {
    setFeatureIndex(selectedFeatureIndex);
  }, []);

  let timeout = React.useRef(null);
  const onUpdate = React.useCallback(
    ({ editType }) => {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(editorRefToState);
      if (editType === "addFeature") {
        dispatch(actions.setMapboxMode(new EditingMode()));
      }
    },
    [dispatch, editorRefToState]
  );

  const deleteFeature = React.useCallback(async () => {
    if (editorRef.current === null) return;
    if (featureIndex !== null) {
      await editorRef.current.deleteFeatures(featureIndex);
    }
  }, [featureIndex]);

  React.useEffect(() => {
    if (state.trigger === null) return;
    switch (state.trigger) {
      case "deleteFeature":
        deleteFeature();
        break;
      case "clearEditor":
        clearEditorRef();
        break;
      default:
        throw new Error(`Unknown trigger: ${state.trigger}`);
    }
    dispatch(actions.setTrigger(null));
  }, [state.trigger, deleteFeature, dispatch, clearEditorRef]);

  return (
    <div id="map-container">
      <MapGL
        {...state.viewport}
        getCursor={() => getCursor(state.mode, state.mapboxMode)}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        onViewportChange={(viewport) => dispatch(actions.setViewport(viewport))}
        mapboxApiAccessToken={TOKEN}
        onMouseMove={(e) => setCursorLocation(e.lngLat)}
      >
        <Display point={cursorLocation} />
        <Editor
          ref={editorRef}
          clickRadius={12}
          mode={state.mapboxMode}
          onSelect={onSelect}
          onUpdate={onUpdate}
          editHandleShape={"circle"}
          featureStyle={getFeatureStyle}
          editHandleStyle={getEditHandleStyle}
        />
        <Source
          type="geojson"
          data={{ type: "FeatureCollection", features: state.fieldPolygons }}
        >
          <Layer
            id="polygons"
            type="line"
            paint={{
              "line-color": "#3cb2d0",
              "line-width": 2,
            }}
            layout={{
              visibility: state.mode !== "polygon" ? "visible" : "none",
            }}
          />
        </Source>
        <Source
          type="geojson"
          data={{ type: "FeatureCollection", features: state.fieldPoints }}
        >
          <Layer
            id="points"
            type="circle"
            paint={{
              "circle-color": "white",
              "circle-radius": 3,
              "circle-opacity": 0.85,
            }}
            layout={{
              visibility: state.mode !== "point" ? "visible" : "none",
            }}
          />
        </Source>
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
        <Source
          type="geojson"
          data={{
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: { type: "LineString", coordinates: state.fieldPath },
                properties: {},
              },
            ],
          }}
        >
          <Layer
            id="path"
            type="line"
            paint={{
              "line-color": "#3cb2d0",
              "line-width": 3,
            }}
            layout={{
              visibility: state.mode !== "path" ? "visible" : "none",
            }}
          />
        </Source>
        <Toolbox />
      </MapGL>
    </div>
  );
}
