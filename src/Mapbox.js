import { useState, useRef, useEffect, useContext } from 'react';

import './App.css';
import mapboxgl from 'mapbox-gl';

import { store } from './Store.js';

mapboxgl.accessToken = 'pk.eyJ1IjoidGhlc3luZWF0ZXIiLCJhIjoiY2twMWJ3MGdjMG9hbzJvbzRkaGxxMG05dyJ9.FuJyojD0OlXLSJbpZlUM3A';

 

const Mapbox = () => {
  const mapContainer = useRef(null);
  const [lng, setLng] = useState(-96.7);
  const [lat, setLat] = useState(40.8);
  const [zoom, setZoom] = useState(8);
  const [pitch, setPitch] = useState(0);
  const [bearing, setBearing] = useState(0);

  const globalState = useContext(store);
  const { state } = globalState;

  var newlat = state.lng;
  var newlng = state.lat;
  var newname = state.name;
  
  //input validation for the forms - start by making sure they are all the right data type
  if (typeof newlat == 'number' && typeof newlng =='number' && typeof newname == 'string'){
    //next check if the numbers are in the accepted lat & lng range
    if(newlat < 90 || newlat > -90 || newlng < 180 || newlng > -180){
      //next check if the numbers are decimals or not
      if(newlat % 1 == 0 && newlng % 1 == 0){
        //if the numbers are decimals cut them down to 
        newlng = newlng.toPrecision(6);
        newlat = newlat.toPrecision(6);
      };
      //make the new point on the map - place it here because we will place the point with or without decimals
    };
  } else {
    console.log("Error incorrect data type")
  }; 
   
   // this is where all of our map logic is going to live
  // adding the empty dependency array ensures that the map
  // is only rendered once
  useEffect(() => {
    // create the map and configure it
    // check out the API reference for more options
    // https://docs.mapbox.com/mapbox-gl-js/api/map/
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v11",
      center: [lng, lat],
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
      attributionControl: false,
    });

    //make sure the map is loaded into the DOM
    map.on("load", () => {
      // add mapbox terrain dem source for 3d terrain rendering
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxZoom: 16,
      });
      map.setTerrain({ source: "mapbox-dem" });

      // add the sky layer
      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 90.0],
          "sky-atmosphere-sun-intensity": 33,
        },
      });
    });

    //on the fly changing the "sidebar values" lat, lng, zoom, pitch, and bearing
    if (!map) return; // wait for map to initialize
      map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });

    // cleanup function to remove map on unmount
    return () => map.remove();
  }, []);

  return (
    <div>
      <div ref={mapContainer} className="mapbox-container">
        <div ref={mapContainer} style={{ width: "100%", height: "100" }} />
          <div className="sidebar">
            Longitude: {lng} | Latitude: {lat} | Zoom: {zoom} 
          </div>
      </div>
     </div>
  );
};

export default Mapbox;