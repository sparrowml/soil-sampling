import { useState, useRef, useEffect } from 'react';

import './App.css';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoidGhlc3luZWF0ZXIiLCJhIjoiY2twMWJ3MGdjMG9hbzJvbzRkaGxxMG05dyJ9.FuJyojD0OlXLSJbpZlUM3A';

const Mapbox = () => {
  const mapContainer = useRef(null);
  const [lng, setLng] = useState(-96.7);
  const [lat, setLat] = useState(40.8);
  const [zoom, setZoom] = useState(8);
  const [pitch, setPitch] = useState(0);
  const [bearing, setBearing] = useState(0);
   
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
      //setPitch(map.getPitch().toFixed(2));
      //setBearing(map.getBearing().toFixed(2));
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