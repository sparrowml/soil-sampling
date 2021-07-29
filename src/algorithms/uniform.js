import classifyPoint from "robust-point-in-polygon";

import { ACRE, SQUARE_SIDE, BOUNDARY_THRESHOLD } from "./constants";
import {
  boundingBox,
  distanceToLine,
  lngLatPoints,
  utmPoints,
  utmString,
} from "./utils";

const generateUniformGrid = (bbox) => {
  const [xmin, ymin, xmax, ymax] = bbox;
  let i = 1;
  let j;
  const grid = [];
  while (xmin + (i * SQUARE_SIDE[ACRE]) / 2 < xmax) {
    j = 1;
    while (ymin + (j * SQUARE_SIDE[ACRE]) / 2 < ymax) {
      grid.push([
        xmin + (i * SQUARE_SIDE[ACRE]) / 2,
        ymin + (j * SQUARE_SIDE[ACRE]) / 2,
      ]);
      j++;
    }
    i++;
  }
  return grid;
};

export function uniformGrid(polygon) {
  const projectionString = utmString(polygon[0]);
  const utm = utmPoints(polygon, projectionString);
  const lines = [];
  for (let i = 0; i < utm.length - 1; i++) {
    lines.push([utm[i][0], utm[i][1], utm[i + 1][0], utm[i + 1][1]]);
  }
  let grid = generateUniformGrid(boundingBox(utm));
  // console.log(grid.length);
  grid = grid.filter((point) => classifyPoint(utm, point) === -1);
  // console.log(grid.length);
  grid = grid.filter((point) => {
    const minDistance = Math.min(
      ...lines.map((line) => distanceToLine(point, line))
    );
    if (minDistance < BOUNDARY_THRESHOLD) {
      return false;
    }
    return true;
  });
  // console.log(grid.length);
  const out = lngLatPoints(grid, projectionString);
  return out;
}
