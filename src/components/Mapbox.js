import React from "react";
import { Editor, EditingMode } from "react-map-gl-draw";
import MapGL, { Source, Layer } from "react-map-gl";

import Toolbox from "./Toolbox";
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
  const [featureIndex, setFeatureIndex] = React.useState(null);
  const editorRef = React.useRef(null);

  const updateFeatureState = React.useCallback(() => {
    if (editorRef.current === null) return;
    const features = editorRef.current.getFeatures();
    const polygons = features.filter(
      (feature) => feature.geometry.type === "Polygon"
    );
    const points = features.filter(
      (feature) => feature.geometry.type === "Point"
    );
    if (polygons.length > 0) dispatch(actions.setFieldPolygons(polygons));
    if (points.length > 0) dispatch(actions.setFieldPoints(points));
  }, [dispatch]);

  const clearFeatures = React.useCallback(async () => {
    if (editorRef.current === null) return;
    for (let i = 0; i < 10; i++) {
      const indices = editorRef.current.getFeatures().map((_, i) => i);
      if (indices.length === 0) {
        break;
      }
      await editorRef.current.deleteFeatures(indices);
    }
  }, []);

  React.useEffect(() => {
    const switchModes = async () => {
      if (editorRef.current === null) return;
      updateFeatureState();
      await clearFeatures();
      switch (state.mode) {
        case "polygon":
          editorRef.current.addFeatures(state.fieldPolygons);
          break;
        case "point":
          editorRef.current.addFeatures(state.fieldPoints);
          break;
        default:
          break;
      }
    };
    switchModes();
  }, [
    state.mode,
    updateFeatureState,
    clearFeatures,
    state.fieldPolygons,
    state.fieldPoints,
  ]);

  const onSelect = React.useCallback(
    ({ selectedFeatureIndex }) => {
      setFeatureIndex(selectedFeatureIndex);
      //   if (
      //     !state.fieldPathMode ||
      //     editorRef.current === null ||
      //     selectedFeatureIndex === null ||
      //     selectedFeatureIndex < 0
      //   )
      //     return;
      //   const feature = editorRef.current.getFeatures()[selectedFeatureIndex];
      //   if (feature.geometry.type === "Point") {
      //     dispatch(actions.addFieldPathPoint(feature.geometry.coordinates));
      //   }
    },
    []
    // [dispatch, state.fieldPathMode]
  );

  // let timeout = React.useRef(null);
  const onUpdate = React.useCallback(
    ({ editType }) => {
      // clearTimeout(timeout.current);
      // timeout.current = setTimeout(updateFeatureState);
      if (editType === "addFeature") {
        dispatch(actions.setMapboxMode(new EditingMode()));
      }
    },
    [dispatch]
    // [updateFeatureState, dispatch]
  );

  // const refreshPoints = React.useCallback(async () => {
  //   if (editorRef.current === null) return;
  //   for (let i = 0; i < 10; i++) {
  //     const deleteIndices = editorRef.current
  //       .getFeatures()
  //       .map((feature, i) => (feature.geometry.type === "Point" ? i : null))
  //       .filter((i) => i !== null);
  //     if (deleteIndices.length === 0) {
  //       break;
  //     }
  //     await editorRef.current.deleteFeatures(deleteIndices);
  //   }
  //   editorRef.current.addFeatures(state.fieldPoints);
  // }, [state.fieldPoints]);

  const deleteFeature = React.useCallback(async () => {
    if (editorRef.current === null) return;
    if (featureIndex !== null) {
      await editorRef.current.deleteFeatures(featureIndex);
      switch (state.mode) {
        case "polygon":
          const newPolygons = [
            ...state.fieldPolygons.slice(0, featureIndex),
            ...state.fieldPolygons.slice(featureIndex + 1),
          ];
          dispatch(actions.setFieldPolygons(newPolygons));
          break;
        case "point":
          const newPoints = [
            ...state.fieldPoints.slice(0, featureIndex),
            ...state.fieldPoints.slice(featureIndex + 1),
          ];
          dispatch(actions.setFieldPoints(newPoints));
          break;
        default:
          break;
      }
    }
  }, [
    featureIndex,
    state.mode,
    state.fieldPolygons,
    state.fieldPoints,
    dispatch,
  ]);

  React.useEffect(() => {
    if (state.trigger === null) return;
    switch (state.trigger) {
      case "refreshPoints":
        // refreshPoints();
        break;
      case "clearFeatures":
        clearFeatures();
        break;
      case "deleteFeature":
        deleteFeature();
        break;
      default:
        throw new Error(`Unknown trigger: ${state.trigger}`);
    }
    dispatch(actions.setTrigger(null));
  }, [state.trigger, clearFeatures, deleteFeature, dispatch]);

  return (
    <div id="map-container">
      <MapGL
        {...state.viewport}
        getCursor={getCursor}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        onViewportChange={(viewport) => dispatch(actions.setViewport(viewport))}
        mapboxApiAccessToken={TOKEN}
      >
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
              visibility: "visible",
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
              "line-color": "black",
              "line-width": 2,
            }}
            layout={{
              visibility: "visible",
            }}
          />
        </Source>
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
        <Toolbox />
      </MapGL>
    </div>
  );
}
