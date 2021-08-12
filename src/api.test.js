import {
  ssurgoService,
  DEMService,
  DEMGET,
  cluBoundary,
  polarisService,
  openElevation,
  topoElevation,
  uniformSample,
} from "./api";

// test('polaris API test', () => {
//   const minlon = -80.200
//   const minlat = 33.195
//   const maxlon = -80.195
//   const maxlat = 33.200
//   const vari = 'silt'
//   const layer = '5_15'
//   return polarisService(minlat,maxlat,minlon,maxlon,vari,layer).then(console.log);
// }, 20000);

// test("open Elevation API test", () => {
//   const lat1 = 40.771;
//   const lng1 = -96.832;
//   const lat2 = 40.8;
//   const lng2 = -96.8;
//   const lat3 = 40.8;
//   const lng3 = -96.79;

//   return openElevation(lat1, lng1, lat2, lng2, lat3, lng3).then(console.log);
// }, 400000);

// test('topo Elevation API test', () => {
//   const lat1 = 40.771;
//   const lng1 = -86.832;
//   const lat2 = 40.8;
//   const lng2 = -86.8;
//   const lat3 = 40.80;
//   const lng3 = -86.79;

//   return topoElevation(lat1, lng1, lat2, lng2, lat3, lng3).then(console.log);
// }, 400000);

// test("elevation data", () => {
//   // Parameters to call DEM Service
//   const values = {
//     aoi: '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-76.5907145, 42.443918], [-76.5898132, 42.4224745], [-76.5699863, 42.4230447], [-76.5710592, 42.4443296], [-76.5907145, 42.443918]]]},"properties":{"OBJECTID":4944402,"CALCACRES":46.15999985,"CALCACRES2":null},"id":4944402}',
//     Elevation_Index: "False",
//     Legend_Ranges: "20",
//   };
//   const headers = { "Content-Type": "application/x-www-form-urlencoded" };
//   return DEMService(values, headers).then((data) =>
//     console.log(JSON.stringify(data))
//   );
// }, 30000);

// test("elevation data get", () => {
//   // Parameters to call DEM Service
//   const values = {
//     fileName: "result_raster_dem_20210717214338086717.TkSuQmjx0xjfaaLPFmxt/PvrhG//P6H91l9Q+FlpZTyH/9C1+5E66SgsBJVW0YOPUgRKWEfJcWiSbhn6Zq56FdB6uMZ6RvkJOCI4O42mNuKtif"};
//   const local_path = "D:\SoilSampleGet";
//   return DEMGET(values, local_path).then((data) =>
//     console.log(JSON.stringify(data))
//   );
// }, 30000);

//May not use below

// test('ssurgo', () => {
//   // Parameters to call SSURGO API
//   const values = {'AOI': '{"geometryType": "esriGeometryPolygon", "features": [{"geometry": {"rings": [[[-85.179, 42.74], [-85.17858886748223, 42.74188232450973], [-85.17858886748223, 42.742675781062474], [-85.1782836915391, 42.742675781062474], [-85.1782226563505, 42.74230956993074], [-85.17529296909521, 42.74230956993074], [-85.17529296909521, 42.74353027370324], [-85.179, 42.74]]], "spatialReference": {"wkid": 4326}}}]}',
//   'Soil_Parameter': 'soc0_5'};
//   // Basic Header Pattern. Header for using a subscription key.
//   const headers = {'Content-Type': 'application/x-www-form-urlencoded', 'Ocp-Apim-Subscription-Key': process.env.SSURGO_API_KEY}
//   return ssurgoService(values, headers).then((data) => console.log(JSON.stringify(data)));
// }, 20000);

// test('CLU Boundary', () => {
//   // Parameters to call CLU API
//  const aoi_point = '{"x":-91.53900737389114,"y": 34.55980772414722}'
//  const Geometry_type = 'point'
//   const values = {
//     'Geometry':aoi_point,
//     'Geometry_type':Geometry_type
//   };

//   const headers = {'Ocp-Apim-Subscription-Key': process.env.CLUBound_APIKeyPrim}
//   return cluBoundary(values, headers).then(console.log);
// }, 15000);

test("uniform-grid", () => {
  // Parameters to call SSURGO API
  const polygon = [
    [-97.00449252110398, 41.16957981959309],
    [-97.00432050553388, 41.16267347064354],
    [-96.9993033847341, 41.16245763550959],
    [-96.9996474158748, 41.16366630310241],
    [-96.99927471547274, 41.165544010323515],
    [-96.99944673104284, 41.16955823838636],
    [-97.00449252110398, 41.16957981959309],
  ];
  uniformSample(polygon).then(() => console.log("foo bar"));
}, 20000);
