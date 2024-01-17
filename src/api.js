// const BASE_URL = "https://eaci7u8499.execute-api.us-east-1.amazonaws.com/dev";
const BASE_URL = "http://localhost:5000";

export async function warmup() {
  await window.fetch(`${BASE_URL}`);
}

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
