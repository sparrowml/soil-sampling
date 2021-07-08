import * as React from 'react';
import { useState, useContext } from 'react';
import {render} from 'react-dom';
import MapGL, { NavigationControl, FullscreenControl, ScaleControl, GeolocateControl } from 'react-map-gl';

import CustomMarker from "./Markers"

import { store } from './Store.js';

const TOKEN = 'pk.eyJ1IjoidGhlc3luZWF0ZXIiLCJhIjoiY2twMWJ3MGdjMG9hbzJvbzRkaGxxMG05dyJ9.FuJyojD0OlXLSJbpZlUM3A'; 

const geolocateStyle = {
  top: 0,
  left: 0,
  padding: '10px'
};

const fullscreenControlStyle = {
  top: 36,
  left: 0,
  padding: '10px'
};

const navStyle = {
  top: 72,
  left: 0,
  padding: '10px'
};

const scaleControlStyle = {
  bottom: 36,
  left: 0,
  padding: '10px'
};

export default function Mapbox() {
  const [viewport, setViewport] = useState({
    latitude: 40,
    longitude: -100,
    zoom: 3.5,
    bearing: 0,
    pitch: 0
    
  });

const globalState = useContext(store);
const { state } = globalState;

var newlat = state.lng;
var newlng = state.lat;
console.log(newlng, newlat)
//var newname = state.name;
var geocords = [];

  //input validation for the forms - start by making sure they are all the right data type
  if (typeof parseFloat(newlat) === 'number' && typeof parseFloat(newlng) ==='number' && newlat != null && newlng != null){
    //next check if the numbers are in the accepted lat & lng range
    if(newlat < 90 || newlat > -90 || newlng < 180 || newlng > -180){
      //next check if the numbers are decimals or not
      if(newlat % 1 === 0 && newlng % 1 === 0){
        //if the numbers are decimals cut them down to 
        newlng = newlng.toPrecision(5);
        newlat = newlat.toPrecision(5);
      };
      //make the new point on the map - place it here because we will place the point with or without decimals
      geocords.push(coordinateFeature(newlng, newlat));
      console.log("Geocords", geocords)
    };
  } else {
    newlng = -96.7;
    newlat = 48.5;
    console.log("Error incorrect data type")
  }; 

  function coordinateFeature(lng, lat, name) {
    return {
      center: [lng, lat],
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      place_name: name,
      place_type: ['coordinate'],
      properties: {},
      type: 'Feature'
      };
    }

  return (
    <>
      <MapGL
        {...viewport}
        width="600px"
        height="600px"
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={setViewport}
        mapboxApiAccessToken={TOKEN}
      >

        
        <CustomMarker longitude={newlng ? parseFloat(newlng) : -96.7} latitude={newlat ? parseFloat(newlat) : 48} />

        <GeolocateControl style={geolocateStyle} />
        <FullscreenControl style={fullscreenControlStyle} />
        <NavigationControl style={navStyle} />
        <ScaleControl style={scaleControlStyle} />
      </MapGL>

    </>
  );
  
}

export function renderToDom(container) {
  render(<Mapbox />, container);
}