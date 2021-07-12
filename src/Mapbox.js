import React from "react";

import MapGL, {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from "react-map-gl";

import CustomMarker from "./Markers";
import { store } from "./Store.js";

const TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN_PK;
const MapH = "600px";
const MapW = "600px";

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
  const [viewport, setViewport] = React.useState({
    latitude: 40.8,
    longitude: -96.7,
    zoom: 7,
    bearing: 0,
    pitch: 0,
  });

  const { state } = React.useContext(store);

  var newlat = state.lng;
  var newlng = state.lat;
  var geocords = [];

  //input validation for the forms - start by making sure they are all the right data type
  if (
    typeof parseFloat(newlat) === "number" &&
    typeof parseFloat(newlng) === "number" &&
    newlat != null &&
    newlng != null
  ) {
    //next check if the numbers are in the accepted lat & lng range
    if (newlat < 90 || newlat > -90 || newlng < 180 || newlng > -180) {
      //next check if the numbers are decimals or not
      if (newlat % 1 === 0 && newlng % 1 === 0) {
        //if the numbers are decimals cut them down to
        // newlng = newlng.toPrecision(5);
        // newlat = newlat.toPrecision(5);
      }
      //make the new point on the map - place it here because we will place the point with or without decimals
      geocords.push(coordinateFeature(newlng, newlat));
    }
  } else {
    newlng = -96.7;
    newlat = 40.8;
  }

  function coordinateFeature(lng, lat, name) {
    return {
      center: [lng, lat],
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
      place_name: name,
      place_type: ["coordinate"],
      properties: {},
      type: "Feature",
    };
  }

  return (
    <>
      <MapGL
        {...viewport}
        width={MapW}
        height={MapH}
        mapStyle="mapbox://styles/thesyneater/ckqwgecqe0eka17mri7ud5xt9"
        onViewportChange={setViewport}
        mapboxApiAccessToken={TOKEN}
      >
        <CustomMarker
          longitude={newlng ? parseFloat(newlng) : -96.7}
          latitude={newlat ? parseFloat(newlat) : 40.8}
        />

        <GeolocateControl style={geolocateStyle} />
        <FullscreenControl style={fullscreenControlStyle} />
        <NavigationControl style={navStyle} />
        <ScaleControl style={scaleControlStyle} />
      </MapGL>
    </>
  );
}
