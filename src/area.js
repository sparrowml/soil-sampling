import { computeArea, LatLng } from "spherical-geometry-js";

export default function getArea(polygon) {
  var latLngs = polygon.map(function (coord) {
    const [lon, lat] = coord;
    return new LatLng(lat, lon);
  });

  return computeArea(latLngs);
}
