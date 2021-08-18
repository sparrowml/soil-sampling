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
            <ol>
              <li>Zoom to region</li>
              <li>Use the drawing tool to define a field boundary</li>
              <li>Select an algorithm for sampling locations</li>
            </ol>
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
                A place for contact information, disclaimer, funding source,
                author credits, and commercial use rights.
              </li>
            </ul>
          </CardContent>
        </Collapse>
      </Card>
    </>
  );
}
