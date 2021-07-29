import React from "react";
import MapGL, { Source, Layer } from "react-map-gl";

import { DrawPolygonMode, EditingMode, Editor } from "react-map-gl-draw";

//import { polarisService, DEMService, ssurgoService, topoElevation } from "../api";

import { uniformGrid } from "../algorithms/uniform";
import { getEditHandleStyle, getFeatureStyle } from "../draw-helpers";

import { store } from "../store";
import * as actions from "../actions";

const TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN_PK;
const MAP_HEIGHT = "600px";
const MAP_WIDTH = "600px";

export default function Mapbox() {
  const { state, dispatch } = React.useContext(store);

  const [mode, setMode] = React.useState(new DrawPolygonMode());
  const [selectedFeatureIndex, setSelectedFeatureIndex] = React.useState(null);
  const editorRef = React.useRef(null);

  const [grid, setGrid] = React.useState({
    type: "FeatureCollection",
    features: [],
  });

  React.useEffect(() => {
    if (state.drawnPolygons.length > 0) {
      let features = [];
      state.drawnPolygons.forEach((polygon) => {
        uniformGrid(polygon.geometry.coordinates[0]).forEach((point) => {
          features.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: point,
            },
          });
        });
      });
      setGrid({
        type: "FeatureCollection",
        features,
      });
    }
  }, [setGrid, state.drawnPolygons]);

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
      if (
        selectedFeatureIndex !== null &&
        selectedFeatureIndex >= 0 &&
        editorRef
      ) {
        editorRef.current.deleteFeatures(selectedFeatureIndex);
        dispatch({
          type: actions.SET_DRAWN_POLYGONS,
          value: [],
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
        mapStyle="mapbox://styles/thesyneater/ckqwgecqe0eka17mri7ud5xt9"
        onViewportChange={(viewport) =>
          dispatch({ type: actions.SET_VIEWPORT, value: viewport })
        }
        mapboxApiAccessToken={TOKEN}
      >
        <Source type="geojson" data={grid}>
          <Layer
            id="grid"
            type="circle"
            paint={{
              "circle-radius": 2.5,
              "circle-color": "white",
            }}
          />
        </Source>
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
      </MapGL>
    </>
  );
}
