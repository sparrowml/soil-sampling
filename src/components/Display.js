import React from "react";

import useStyles from "../styles";
import { legacyStore } from "../store";

function inside(point, polygon) {
  // ray-casting algorithm
  const [x, y] = point;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    // prettier-ignore
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

export default function Display({ point }) {
  const { state } = React.useContext(legacyStore);
  const classes = useStyles();

  if (state.mode !== "select") return null;

  for (let i = 0; i < state.fieldRegions.length; i++) {
    const regionPolygon = state.fieldRegions[i].geometry.coordinates[0];
    if (inside(point, regionPolygon)) {
      const regionId = state.fieldRegionIds[i];
      const description = state.regionNameMap[regionId];
      if (!description) return null;
      return (
        <div className={classes.display}>
          <p className={classes.displayText}>{description}</p>
        </div>
      );
    }
  }

  return null;
}
