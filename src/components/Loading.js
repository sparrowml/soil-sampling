import React from "react";

import Loader from "react-loader-spinner";
import Modal from "@material-ui/core/Modal";

import { legacyStore } from "../store";
import useStyles from "../styles";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

export default function Loading() {
  const { state } = React.useContext(legacyStore);
  const classes = useStyles();

  return (
    <Modal open={state.loading}>
      <div style={getModalStyle()} className={classes.modalPaper}>
        <Loader type="Bars" color="#00BFFF" height={100} width={100} />
      </div>
    </Modal>
  );
}
