import React from "react";

import MapGL, {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from "react-map-gl";

import CustomMarker from "./Markers";

import { store } from "../store.js";

const TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN_PK;
const MAP_HEIGHT = "600px";
const MAP_WIDTH = "600px";

const geolocateStyle = {
  top: 0,
  left: 0,
  padding: "10px",
};

const fullscreenControlStyle = {
  top: 36,
  left: 0,
  padding: "10px",
};

const navStyle = {
  top: 72,
  left: 0,
  padding: "10px",
};

const scaleControlStyle = {
  bottom: 36,
  left: 0,
  padding: "10px",
};

export default function Mapbox() {
  const { state } = React.useContext(store);

  const [viewport, setViewport] = React.useState({
    latitude: 40.8,
    longitude: -96.7,
    zoom: 7,
    bearing: 0,
    pitch: 0,
  });

  return (
    <>
      <MapGL
        {...viewport}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        mapStyle="mapbox://styles/thesyneater/ckqwgecqe0eka17mri7ud5xt9"
        onViewportChange={setViewport}
        mapboxApiAccessToken={TOKEN}
      >
        <CustomMarker longitude={state.longitude} latitude={state.latitude} />
        <GeolocateControl style={geolocateStyle} />
        <FullscreenControl style={fullscreenControlStyle} />
        <NavigationControl style={navStyle} />
        <ScaleControl style={scaleControlStyle} />
      </MapGL>
    </>
  );
}
