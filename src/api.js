const BASE_URL = "https://soil-sampling.ngrok.dev";
// const BASE_URL = "http://localhost:5000";

export async function warmup() {
  await window.fetch(`${BASE_URL}`);
}

export const pointMap = (point, id, regionId, pointData = null) => ({
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: point,
  },
  properties: {
    id,
    regionId,
    pointData,
  },
});

export const polygonMap = (polygon) => ({
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [polygon],
  },
  properties: {},
});

export async function getMunames(mukeys) {
  const url = "https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest";
  const uniqueMukeys = Array.from(new Set(mukeys));
  const query = `
  SELECT mukey, muname
  FROM mapunit
  WHERE mukey IN ('${uniqueMukeys.join("', '")}');
  `;
  return window
    .fetch(url, {
      method: "POST",
      body: JSON.stringify({
        QUERY: query,
        FORMAT: "JSON",
      }),
    })
    .then((response) => response.json())
    .catch(console.error);
}

export async function getMapUnits(polygon) {
  const fieldRegions = [];
  const fieldRegionIds = [];
  const response = await window
    .fetch(`${BASE_URL}/mapunits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        polygon,
      }),
    })
    .then((response) => response.json())
    .catch(console.error);
  fieldRegions.push(...response.regions.map(polygonMap));
  fieldRegionIds.push(...response.region_mukey_ids);
  const result = await getMunames(response.region_mukey_ids);
  if (!result.Table) return {};
  const mukeyNameMap = {};
  result.Table.forEach((row) => {
    const [id, name] = row;
    mukeyNameMap[id] = name;
  });
  return [fieldRegions, fieldRegionIds, mukeyNameMap];
}

export async function uniformSample(polygon, acre, triangleOffset) {
  return window
    .fetch(`${BASE_URL}/uniform`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        polygon,
        acre,
        triangleOffset,
      }),
    })
    .then((response) => response.json())
    .catch(console.error);
}

export async function voronoiSample(polygon, nPoints) {
  return window
    .fetch(`${BASE_URL}/voronoi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        polygon,
        nPoints,
      }),
    })
    .then((response) => response.json())
    .catch(console.error);
}

export async function cema221(polygon, nPoints) {
  return window
    .fetch(`${BASE_URL}/cema221`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        polygon,
        nPoints,
      }),
    })
    .then((response) => response.json())
    .catch(console.error);
}

export async function clusteringSample(polygon, nPoints, data) {
  const body = { polygon, nPoints, includeElevation: true };
  if (data) {
    body["data"] = data;
  }
  return window
    .fetch(`${BASE_URL}/clustering`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    .then((response) => response.json())
    .catch(console.error);
}
