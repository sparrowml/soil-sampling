import React from "react";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

import { store } from "../store";
import * as actions from "../actions";
import * as api from "../api";

const clusterId = (description) =>
  description.split("Cluster: ")[1].split(";")[0];

const pointMap = (point, id, regionId, pointData = null) => ({
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
    dispatch(actions.setLoading(true));
    dispatch(actions.setMode("select"));
    dispatch(actions.setTrigger("clearEditor"));
    dispatch(actions.setFieldPoints([]));
    dispatch(actions.setFieldRegions([]));
    dispatch(actions.setFieldRegionIds([]));
    dispatch(actions.setFieldPath([]));
    const fieldPath = [];
    const fieldPoints = [];
    const fieldRegions = [];
    const fieldRegionIds = [];
    await api.warmup();
    for (const feature of state.fieldPolygons) {
      const polygon = feature.geometry.coordinates[0];
      let response;
      if (state.algo === "uniform") {
        response = await api.uniformSample(
          polygon,
          state.sampleArea,
          state.triangleOffset
        );
        if (!response) return;
        if (response.points) {
          fieldPoints.push(
            ...response.points.map((point, i) => pointMap(point, i + 1, "", ""))
          );
          fieldPath.push(...response.points);
        }
      } else if (state.algo === "voronoi") {
        response = await api.voronoiSample(polygon, state.nPoints);
        if (!response) return;
        if (response.points) {
          fieldPoints.push(
            ...response.points.map((point, i) =>
              pointMap(point, i + 1, response.mukey_ids[i])
            )
          );
          fieldPath.push(...response.points);
        }
        if (response.regions) {
          fieldRegions.push(...response.regions.map(polygonMap));
          fieldRegionIds.push(...response.region_mukey_ids);
        }
        api.getMunames(response.region_mukey_ids).then((result) => {
          if (!result.Table) return;
          const mukeyNameMap = {};
          result.Table.forEach((row) => {
            const [id, name] = row;
            mukeyNameMap[id] = name;
          });
          dispatch(actions.setRegionNameMap(mukeyNameMap));
        });
      } else if (state.algo === "clustering") {
        response = await api.clusteringSample(
          polygon,
          state.nPoints,
          state.inputData
        );
        if (!response) return;
        if (response.points) {
          fieldPoints.push(
            ...response.points.map((point, i) =>
              pointMap(
                point,
                i + 1,
                clusterId(response.point_descriptions[i]),
                response.point_enrichments[i]
              )
            )
          );
          fieldPath.push(...response.points);
        }
        if (response.regions) {
          fieldRegions.push(...response.regions.map(polygonMap));
          fieldRegionIds.push(...response.region_descriptions.map(clusterId));
        }
        if (response.region_descriptions) {
          const regionNameMap = {};
          response.region_descriptions.forEach((description) => {
            const id = clusterId(description);
            regionNameMap[id] = description;
          });
          dispatch(actions.setRegionNameMap(regionNameMap));    
        }
      }
      if (response.error) {
        dispatch(actions.setLoading(false));
        alert(response.error);
        return;
      }
    }
    if (fieldPoints.length === 0) {
      dispatch(actions.setLoading(false));
      alert("An error occurred with the API");
      return;
    }
    dispatch(actions.setFieldPoints(fieldPoints));
    dispatch(actions.setFieldRegions(fieldRegions));
    dispatch(actions.setFieldRegionIds(fieldRegionIds));
    dispatch(actions.setFieldPath(fieldPath));
    dispatch(actions.setLoading(false));
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
    </Grid>
  );
}
