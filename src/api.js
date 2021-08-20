// const BASE_URL = "https://eaci7u8499.execute-api.us-east-1.amazonaws.com/dev";
const BASE_URL = "http://localhost:5000";

export async function uniformSample(polygon, acre) {
  return window
    .fetch(`${BASE_URL}/uniform`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        polygon,
        acre,
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
