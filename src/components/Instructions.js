import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Collapse from "@material-ui/core/Collapse";

import IconButton from "@material-ui/core/IconButton";
import ExpandMore from "@material-ui/icons/ExpandMore";
import ExpandLess from "@material-ui/icons/ExpandLess";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  button: {
    backgroundColor: "transparent",
  },
  cardContent: {
    paddingTop: "0px",
    marginTop: "-10px",
  },
}));

export default function Instructions() {
  const classes = useStyles();

  const [instructions, setInstructions] = React.useState(false);
  const [disclaimer, setDisclaimer] = React.useState(false);

  const toggleInstructions = (event) => {
    event.preventDefault();
    setInstructions(!instructions);
  };

  const toggleDisclaimer = (event) => {
    event.preventDefault();
    setDisclaimer(!disclaimer);
  };

  const instructionsButton = (
    <IconButton
      size="small"
      disableRipple
      disableFocusRipple
      className={classes.button}
    >
      Instructions
      {instructions ? <ExpandLess /> : <ExpandMore />}
    </IconButton>
  );

  const disclaimerButton = (
    <IconButton
      size="small"
      disableRipple
      disableFocusRipple
      className={classes.button}
    >
      Disclaimer
      {disclaimer ? <ExpandLess /> : <ExpandMore />}
    </IconButton>
  );

  return (
    <>
      <Card>
        <CardHeader
          subheader={instructionsButton}
          onClick={toggleInstructions}
        ></CardHeader>
        <Collapse in={instructions} unmountOnExit>
          <CardContent className={classes.cardContent}>
            <p>Basic instructions:</p>
            <ol>
              <li>Zoom to the region of interest by typing a longitude and latitude or by manipulating the map.</li>
              <li>Use the drawing tool to define a field boundary polygon.</li>
              <li>Select an algorithm for sampling locations and set input parameters.</li>
              <li>Edit points that are returned by the algorithm if necessary.</li>
              <li>Click the export icon to download the result.</li>
            </ol>
            <p>
              Take a look at a video demo of the app{" "}
              <a href="https://www.youtube.com/watch?v=jI1N_G_u0Zw">here</a>.
            </p>            
          </CardContent>
        </Collapse>
        <CardHeader
          subheader={disclaimerButton}
          onClick={toggleDisclaimer}
        ></CardHeader>
        <Collapse in={disclaimer} unmountOnExit>
          <CardContent className={classes.cardContent}>
            <ul>
              <li>
                Public Domain Notice: This software/database is a "United States Government Work" under the terms of the United States Copyright Act. It was written as part of the author's official duties as a United States Government employee and thus cannot be copyrighted. This software/database is freely available to the public for use. The Agricultural Research Service (ARS) and the U.S. Government have not placed any restriction on its use or reproduction. Although all reasonable efforts have been taken to ensure the accuracy and reliability of the software and data, the ARS and the U.S. Government do not and cannot warrant the performance or results that may be obtained by using this software or data. The ARS and the U.S. Government disclaim all warranties, express or implied, including warranties of performance, merchant ability or fitness for any particular purpose.
              </li>
              <li>
                Mention of trade names or commercial products in this publication is solely for the purpose of providing specific information and does not imply recommendation or endorsement by the U.S. Department of Agriculture (USDA). USDA is an equal opportunity provider and employer.
              </li>
              <li>
                This research included collaborative contributions from the USDA Agricultural Research Service (ARS) Partnerships in Data Innovations (PDI). PDI is supported by the United States Department of Agriculture.
              </li>
            </ul>
          </CardContent>
        </Collapse>
      </Card>
    </>
  );
}
