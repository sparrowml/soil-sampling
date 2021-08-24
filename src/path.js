import tokml from "tokml";

const distance = (point1, point2) => {
  return Math.sqrt(
    Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)
  );
};

const minDistance = (point, points) => {
  let min = Infinity;
  let bestPoint = points[0];
  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i].geometry.coordinates;
    const dist = distance(point, [x, y]);
    if (dist < min) {
      min = dist;
      bestPoint = points[i];
    }
  }
  return bestPoint;
};

export const orderedPoints = (fieldPath, points) => {
  const ordered = [];
  for (let i = 0; i < fieldPath.length; i++) {
    ordered.push(minDistance(fieldPath[i], points));
  }
  return ordered;
};

export const toCsv = (points) => {
  const csv = [
    "id,longitude,latitude",
    ...points.map((point) => {
      const id = point.properties.id;
      const [x, y] = point.geometry.coordinates;
      return `${id},${x},${y}`;
    }),
  ];
  return csv.join("\n");
};

export const toKml = (points) => {
  return tokml({
    type: "FeatureCollection",
    features: points,
  });
};

export const toGeojson = (points) => {
  return {
    type: "FeatureCollection",
    features: points,
  };
};
