import React from "react";
import MapGL, {Source, Layer} from 'react-map-gl';

import {
  RENDER_STATE,
  DrawPolygonMode,
  EditingMode,
  Editor,
} from "react-map-gl-draw";

import CustomMarker from "./CustomMarker";
import { polarisService, DEMService, ssurgoService } from "../api";

import { store } from "../store";
import * as actions from "../actions";

import {MapStyle} from '../Mapstyle.js';

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

//------------------------POLARIS API---------------------------------//
//if(state.Polaris === true){
  // const minlon = state.viewport.longitude;
  // const minlat = state.viewport.latitude;
  // const maxlon = state.viewport.longitude + 0.02;
  // const maxlat = state.viewport.latitude + 0.02;
  // const vari = 'silt'
  // const layer = '5_15'
  // const Polarisdata = polarisService(minlat,maxlat,minlon,maxlon,vari,layer);
//};
//------------------------POLARIS API---------------------------------//


//------------------------DEM API------------------------------------//
// if(state.DEMS === true){
//   const DEMvalues = {
//     aoi: '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-76.5907145, 42.443918], [-76.5898132, 42.4224745], [-76.5699863, 42.4230447], [-76.5710592, 42.4443296], [-76.5907145, 42.443918]]]},"properties":{"OBJECTID":4944402,"CALCACRES":46.15999985,"CALCACRES2":null},"id":4944402}',
//     Elevation_Index: "False",
//     Legend_Ranges: "20",
//   };

//   const DEMheaders = { "Content-Type": "application/x-www-form-urlencoded" };

//   const DEMdata = DEMService(DEMvalues, DEMheaders);
// };
//------------------------DEM API------------------------------------//


//------------------------SSURGO API---------------------------------//
// if(state.SSURGO === true) {
// const SSURGOvalues = {'AOI': '{"geometryType": "esriGeometryPolygon", "features": [{"geometry": {"rings": [[[-85.179, 42.74], [-85.17858886748223, 42.74188232450973], [-85.17858886748223, 42.742675781062474], [-85.1782836915391, 42.742675781062474], [-85.1782226563505, 42.74230956993074], [-85.17529296909521, 42.74230956993074], [-85.17529296909521, 42.74353027370324], [-85.17529296909521, 42.74371337926908], [-85.17492675796348, 42.74389648393566], [-85.17437744126585, 42.744079589501496], [-85.17340087914721, 42.744079589501496], [-85.17327880876996, 42.74749755826576], [-85.17401123013411, 42.74749755826576], [-85.17401123013411, 42.74847412128372], [-85.17529296909521, 42.74847412128372], [-85.17590332008211, 42.74829101571788], [-85.17749023408697, 42.74792480458609], [-85.17761230446422, 42.7470703128447], [-85.1782836915391, 42.746704101712965], [-85.18072509728535, 42.746704101712965], [-85.179, 42.74]]], "spatialReference": {"wkid": 4326}}}]}',
//   'Soil_Parameter': 'nccpi2all',
//   'Projection': 'EPSG:4326',
//   'Resolution': 0.00001,
//   'Product':'GeoJSON'};

//   const SSURGOheaders = {'Content-Type': 'application/x-www-form-urlencoded', 'Ocp-Apim-Subscription-Key': process.env.SSURGO_API_KEY};
//   const SSURGOdata = ssurgoService(SSURGOvalues, SSURGOheaders);
// }
  //------------------------SSURGO API---------------------------------//

  const [mode, setMode] = React.useState(null);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = React.useState(null);
  const editorRef = React.useRef(null);

  const onDrawMode = React.useCallback((event) => {
    event.preventDefault();
    setMode(new DrawPolygonMode());
  }, []);

  const onSelect = React.useCallback((options) => {
    setSelectedFeatureIndex(options && options.selectedFeatureIndex);
    console.log(state.Drawn_Polygons);
    console.log("Drawn Polygons", state.Drawn_Polygons);
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
        mapStyle="mapbox://styles/thesyneater/ckqwgecqe0eka17mri7ud5xt9"
        onViewportChange={(viewport) =>
          dispatch({ type: actions.SET_VIEWPORT, value: viewport })
        }
        mapboxApiAccessToken={TOKEN}
      >
        {/* <Source type="geojson" data={Polarisdata}>
          <Layer {...MapStyle} />
        </Source> */}

        {/* <Source type="geojson" data={DEMdata}>
          <Layer {...MapStyle} />
        </Source> */}

        {/* <Source type="geojson" data={Surrgodata}>
          <Layer {...MapStyle} />
        </Source> */}

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