import proj4 from "proj4";

// const wgs84String =
//   "+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees +no_defs";

export function utmString(point) {
  const zone = (Math.floor((point[0] + 180) / 6) % 60) + 1;
  return `+proj=utm +zone=${zone} +ellps=GRS80 +datum=nad83 +units=m +no_defs`;
}

export function utmPoints(points, projectionString) {
  const proj = proj4(projectionString);
  return points.map((point) => {
    return proj.forward(point);
  });
}

export function lngLatPoints(points, projectionString) {
  const proj = proj4(projectionString);
  return points.map((point) => {
    return proj.inverse(point);
  });
}

export function boundingBox(points) {
  const xmin = Math.min(...points.map((point) => point[0]));
  const xmax = Math.max(...points.map((point) => point[0]));
  const ymin = Math.min(...points.map((point) => point[1]));
  const ymax = Math.max(...points.map((point) => point[1]));

  return [xmin, ymin, xmax, ymax];
}

export function distanceToLine(point, line) {
  const distance = (point, x, y) => {
    const [px, py] = point;
    const dx = x - px;
    const dy = y - py;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const [x, y] = point;
  const [sx, sy, ex, ey] = line;
  const dx = ex - sx;
  const dy = ey - sy;
  const l2 = dx * dx + dy * dy;

  if (l2 === 0) {
    return distance(point, sx, sy);
  }

  let t = ((x - sx) * dx + (y - sy) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return distance(point, sx + t * dx, sy + t * dy);
}
