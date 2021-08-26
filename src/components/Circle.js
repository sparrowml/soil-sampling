import React from "react";
import { Marker } from "react-map-gl";

import { store } from "../store";
import * as actions from "../actions";

export default function Circle({ markerId, markerType, longitude, latitude }) {
  const { dispatch } = React.useContext(store);
  const size = 10;

  const onDragEnd = (event) => {
    event.preventDefault();
    const [longitude, latitude] = event.lngLat;
    dispatch({
      type: actions.SET_MARKER,
      markerId,
      markerType,
      value: { longitude, latitude },
    });
  };

  return (
    <div>
      <Marker
        longitude={longitude}
        latitude={latitude}
        draggable
        onDragEnd={onDragEnd}
        offsetLeft={-size / 2}
        offsetTop={-size}
      >
        <svg
          height={size}
          viewBox="0 0 24 24"
          style={{ fill: "#f03b20", stroke: "none", fillOpacity: 0.85 }}
        >
          <circle cx="12" cy="12" r="12" />
        </svg>
      </Marker>
    </div>
  );
}
