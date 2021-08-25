import React from "react";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

import { store } from "../store";
import * as actions from "../actions";
import * as api from "../api";
import SavePointsModal from "./SavePointsModal";

const pointMap = (point, id, mukey, muname) => ({
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: point,
  },
  properties: {
    id,
    mukey,
    muname,
  },
});

const polygonMap = (polygon) => ({
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [polygon],
  },
  properties: {},
});

export default function SubmitActions({ className }) {
  const { state, dispatch } = React.useContext(store);

  const generatePoints = async (event) => {
    event.preventDefault();
    dispatch(actions.setFieldPoints([]));
    dispatch(actions.setFieldMukeys([]));
    dispatch(actions.setFieldPath([]));
    dispatch(actions.setTrigger("refreshPoints"));
    const fieldPath = [];
    const fieldPoints = [];
    const fieldMukeys = [];
    for (const feature of state.fieldPolygons) {
      const polygon = feature.geometry.coordinates[0];
      let response;
      if (state.algo === "uniform") {
        response = await api.uniformSample(polygon, state.sampleArea);
        if (response.points) {
          fieldPoints.push(...response.points.map(pointMap));
          fieldPath.push(...response.points);
        }
      } else if (state.algo === "voronoi") {
        response = await api.voronoiSample(polygon, state.nPoints);
        console.log(response);
        if (response.points) {
          fieldPoints.push(
            ...response.points.map((point, i) =>
              pointMap(point, i, response.mukey_ids[i], response.mukey_names[i])
            )
          );
          fieldPath.push(...response.points);
        }
        if (response.regions)
          fieldMukeys.push(...response.regions.map(polygonMap));
      }
      if (response.error) {
        alert(response.error);
        return;
      }
    }
    dispatch(actions.setFieldPoints(fieldPoints));
    dispatch(actions.setFieldMukeys(fieldMukeys));
    dispatch(actions.setFieldPath(fieldPath));
    dispatch(actions.setTrigger("refreshPoints"));
  };

  return (
    <Grid container direction="row">
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          className={className}
          onClick={generatePoints}
        >
          Generate Points
        </Button>
      </Grid>
      <Grid item>
        <SavePointsModal />
      </Grid>
    </Grid>
  );
}
