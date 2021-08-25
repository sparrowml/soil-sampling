import * as React from "react";
import { DrawPolygonMode, DrawPointMode } from "react-map-gl-draw";
import styled from "styled-components";
import "boxicons";

import { store } from "../store";
import * as actions from "../actions";

const Tools = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 10px;
  right: 10px;
`;

const Button = styled.button`
  color: #fff;
  background: ${({ kind, active }) =>
    kind === "danger"
      ? "rgb(180, 40, 40)"
      : active
      ? "rgb(0, 105, 217)"
      : "rgb(90, 98, 94)"};
  font-size: 1em;
  font-weight: 400;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  border: 1px solid transparent;
  border-radius: 0.25em;
  margin: 0.05em;
  padding: 0.1em 0.2em;
  :hover {
    background: rgb(128, 137, 133);
  }
`;

const MODES = [
  { mode: "select", content: <Icon name="pointer" />, title: "Select" },
  { mode: "polygon", content: <Icon name="shape-polygon" />, title: "Polygon" },
  { mode: "point", content: <Icon name="map-pin" />, title: "Point" },
  { mode: "path", content: <Icon name="stats" />, title: "Path" },
];

function Icon(props) {
  return <box-icon color="currentColor" {...props} />;
}

export default function Toolbox() {
  const { state, dispatch } = React.useContext(store);

  const newClick = () => {
    switch (state.mode) {
      case "polygon":
        dispatch(actions.setMapboxMode(new DrawPolygonMode()));
        return;
      case "point":
        dispatch(actions.setMapboxMode(new DrawPointMode()));
        return;
      default:
        return;
    }
  };

  return (
    <>
      <Tools>
        {MODES.map((modeConfig, i) => (
          <Button
            key={i}
            active={state.mode === modeConfig.mode}
            onClick={() => dispatch(actions.setMode(modeConfig.mode))}
            title={modeConfig.title}
          >
            {modeConfig.content}
          </Button>
        ))}

        <br />

        <Button onClick={newClick} title="New">
          <Icon name="plus" />
        </Button>

        <Button
          onClick={() => dispatch(actions.setTrigger("deleteFeature"))}
          title="Delete"
        >
          <Icon name="trash" />
        </Button>

        <br />

        <Button onClick={() => console.log("export")} title="Export">
          <Icon name="export" />
        </Button>
      </Tools>
    </>
  );
}
