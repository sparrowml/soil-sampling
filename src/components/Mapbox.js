import React from "react";
import { Editor, EditingMode, DrawPolygonMode } from "react-map-gl-draw";
import MapGL, { Source, Layer } from "react-map-gl";

import * as actions from "../actions";
import { store } from "../store";
import { getFeatureStyle, getEditHandleStyle } from "../styles";

const TOKEN =
  "pk.eyJ1IjoiamJlbmNvb2sxIiwiYSI6ImNrc2h6a3hkazBhd28ydm41MTA4MGw5ODIifQ.i9LnGAqi7LO478W227kNgw";
const MAP_HEIGHT = "600px";
const MAP_WIDTH = "600px";

export default function Mapbox() {
  const { state, dispatch } = React.useContext(store);
  const [mode, setMode] = React.useState(new DrawPolygonMode());
  const [selectedFeatureIndex, setSelectedFeatureIndex] = React.useState(null);
  const editorRef = React.useRef(null);

  const onSelect = React.useCallback((options) => {
    setSelectedFeatureIndex(options && options.selectedFeatureIndex);
  }, []);

  const onDelete = React.useCallback(() => {
    if (selectedFeatureIndex !== null && selectedFeatureIndex >= 0) {
      editorRef.current.deleteFeatures(selectedFeatureIndex);
    }
  }, [selectedFeatureIndex]);

  let timeout;
  const onUpdate = React.useCallback(({ editType }) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
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
    });
    if (editType === "addFeature") {
      setMode(new EditingMode());
    }
  }, []);

  React.useEffect(() => {
    const refresh = async () => {
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
    if (editorRef.current !== null) {
      refresh();
    }
  }, [state.refreshPoints]);

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
