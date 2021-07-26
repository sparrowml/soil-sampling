//Polaris soil data
export async function polarisService(
  minlat,
  maxlat,
  minlon,
  maxlon,
  vari,
  layer
) {
  const url = `http://152.3.67.2:8000/polaris/${minlon}$${minlat}$${maxlon}$${maxlat}$${layer}$${vari}`;
  console.log(url);
  return window
    .fetch(url)
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .catch(console.error);
}

//Open Elevation
export async function openElevation(lat1, lng1, lat2, lng2, lat3, lng3){
  const url = `https://api.open-elevation.com/api/v1/lookup?locations=${lat1},${lng1}|${lat2},${lng2}|${lat3},${lng3}`;
  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  console.log(url);
  return window
    .fetch(proxyurl + url)
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .catch(console.error);
}

//Topo Elevation
export async function topoElevation(lat1, lng1, lat2, lng2, lat3, lng3){
  const url = `https://api.opentopodata.org/v1/test-dataset?locations=${lng1},${lat1}|${lng2},${lat2}|${lng3},${lat3}`;
  console.log(url);
  return window
    .fetch(url)
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .catch(console.error);
}

//Elevation
export async function DEMService(values, headers) {
  const url = "https://ag-analytics.azure-api.net/dem-service";
  return window
    .fetch(url, {
      method: "POST",
      headers: headers,
      body: new URLSearchParams(values),
    })
    .then((response) => response.json())
    .catch(console.error);
}

//Elevation GET
export async function DEMGET(values, local_path) {
  const url = "https://ag-analytics.azure-api.net/dem-service";
  return window
    .fetch(url, {
      method: "GET",
      body: new URLSearchParams(values),
    })
    .then((response) => response.json())
    .catch(console.error);
}



//May not use below

//SSurgo
export async function ssurgoService(values, headers) {
  const url = "https://ag-analytics.azure-api.net/ssurgo-v2";
  return window
    .fetch(url, {
      method: "POST",
      headers: headers,
      body: new URLSearchParams(values),
    })
    .then((response) => response.json())
    .catch(console.error);
}

//CLU 2008 Boundary
export async function cluBoundary() {
  const url = "https://ag-analytics.azure-api.net/CommonLandUnitBoundary-v2";
  return window
    .fetch(url, {})
    .then((response) => response.json())
    .catch(console.error);
}
