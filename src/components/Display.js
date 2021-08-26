import React from "react";

import useStyles from "../styles";
import { store } from "../store";

function inside(point, polygon) {
  // ray-casting algorithm
  const [x, y] = point;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    // prettier-ignore
    const intersect =
    ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

export default function Display({ point }) {
  const { state } = React.useContext(store);
  const classes = useStyles();

  if (state.mode !== "select") return null;

  for (let i = 0; i < state.fieldMukeys.length; i++) {
    const mukeyPolygon = state.fieldMukeys[i].geometry.coordinates[0];
    if (inside(point, mukeyPolygon)) {
      const muname = state.fieldMunames[i];
      return (
        <div className={classes.display}>
          <p className={classes.displayText}>{muname}</p>
        </div>
      );
    }
  }

  return null;
}
