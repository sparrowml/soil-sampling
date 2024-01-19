import React from "react";
import { useDispatch, useSelector } from "react-redux";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

import { legacyStore } from "../store";
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
  const { state, dispatch: legacyDispatch } = React.useContext(legacyStore);
  const aoi = useSelector((state) => state.aoi);
  const currentRegionNameMap = useSelector((state) => state.regionNameMap);
  const dispatch = useDispatch();
  const fieldPolygons = useSelector((state) => state.fieldPolygons);

  const generatePoints = async (event) => {
    event.preventDefault();
    legacyDispatch(actions.setLoading(true));
    legacyDispatch(actions.setMode("select"));
    legacyDispatch(actions.setTrigger("clearEditor"));
    legacyDispatch(actions.setFieldPoints([]));
    legacyDispatch(actions.setFieldRegions([]));
    legacyDispatch(actions.setFieldRegionIds([]));
    legacyDispatch(actions.setFieldPath([]));
    const fieldPath = [];
    const fieldPoints = [];
    const fieldRegions = [];
    const fieldRegionIds = [];
    await api.warmup();
    for (const feature of fieldPolygons) {
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
        dispatch(actions.setRegionNameMap(await api.getMapUnits(polygon)));
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
      } else if (state.algo?.startsWith("cema221")) {
        if (aoi > 10) {
          legacyDispatch(actions.setLoading(false));
          alert("Select another AOI with 10 or fewer acres");
          return;
        }
        if (state.algo === "cema221scss") {
          if (Object.keys(currentRegionNameMap).length > 3) {
            legacyDispatch(actions.setLoading(false));
            alert("Select another AOI with 3 or fewer soil map units");
            return;
          }
          response = await api.cema221(polygon, 6);
        } else if (state.algo === "cema221cs") {
          if (Object.keys(currentRegionNameMap).length !== 3) {
            legacyDispatch(actions.setLoading(false));
            alert("Select another AOI with exactly 3 soil map units");
            return;
          }
          response = await api.cema221(polygon, 9);
        }
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
        legacyDispatch(actions.setLoading(false));
        alert(response.error);
        return;
      }
    }
    if (fieldPoints.length === 0) {
      legacyDispatch(actions.setLoading(false));
      alert("An error occurred with the API");
      return;
    }
    legacyDispatch(actions.setFieldPoints(fieldPoints));
    legacyDispatch(actions.setFieldRegions(fieldRegions));
    legacyDispatch(actions.setFieldRegionIds(fieldRegionIds));
    legacyDispatch(actions.setFieldPath(fieldPath));
    legacyDispatch(actions.setLoading(false));
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
