import tokml from "tokml";

const distance = (point1, point2) => {
  return Math.sqrt(
    Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)
  );
};

const minDistance = (point, points) => {
  let min = Infinity;
  const pointObjects = Array.from(points).map(JSON.parse);
  let bestPoint = pointObjects[0];
  for (let i = 0; i < pointObjects.length; i++) {
    const [x, y] = pointObjects[i].geometry.coordinates;
    const dist = distance(point, [x, y]);
    if (dist < min) {
      min = dist;
      bestPoint = pointObjects[i];
    }
  }
  return JSON.stringify(bestPoint);
};

export const orderedPoints = (fieldPath, points) => {
  const ordered = [];
  const allPoints = new Set(points.map(JSON.stringify));
  for (let i = 0; i < fieldPath.length; i++) {
    const nextPoint = minDistance(fieldPath[i], allPoints);
    allPoints.delete(nextPoint);
    ordered.push(JSON.parse(nextPoint));
  }
  const remaining = Array.from(allPoints)
    .map(JSON.parse)
    .sort((a, b) => a.id - b.id);
  return [...ordered, ...remaining];
};

export const toCsv = (points, regionNameMap) => {
  const csv = [
    "id,longitude,latitude,regionId,description",
    ...points.map((point) => {
      const { id, regionId, pointData } = point.properties;
      const description = pointData || regionNameMap[regionId] || "";
      const [x, y] = point.geometry.coordinates;
      return `${id},${x},${y},${regionId},${description}`;
    }),
  ];
  return csv.join("\n");
};

export const toKml = (points, regionNameMap) => {
  const data = toGeojson(points, regionNameMap);
  return tokml(data);
};

export const toGeojson = (points, regionNameMap) => {
  return {
    type: "FeatureCollection",
    features: points.map((point) => {
      const description = regionNameMap[point.properties.regionId] || "";
      const properties = { ...point.properties, description };
      return {
        ...point,
        properties,
      };
    }),
  };
};
