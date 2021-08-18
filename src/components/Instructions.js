import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Collapse from "@material-ui/core/Collapse";

import IconButton from "@material-ui/core/IconButton";
import ExpandMore from "@material-ui/icons/ExpandMore";
import ExpandLess from "@material-ui/icons/ExpandLess";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  cardContent: {
    paddingTop: "0px",
    marginTop: "-10px",
  },
}));

export default function Instructions() {
  const classes = useStyles();

  const [collapseOpen, setCollapseOpen] = React.useState(false);

  const toggleInstructions = (event) => {
    event.preventDefault();
    setCollapseOpen(!collapseOpen);
  };

  const button = (
    <IconButton
      size="small"
      disableRipple
      disableFocusRipple
      style={{ backgroundColor: "transparent" }}
      aria-label="expand"
    >
      Instructions
      {collapseOpen ? <ExpandLess /> : <ExpandMore />}
    </IconButton>
  );

  return (
    <>
      <Card>
        <CardHeader
          subheader={button}
          onClick={toggleInstructions}
          // subheaderTypographyProps={subheaderTypographyProps}
        ></CardHeader>
        <Collapse in={collapseOpen} unmountOnExit>
          <CardContent className={classes.cardContent}>
            <ol>
              <li>Zoom to region</li>
              <li>Use the drawing tool to define a field boundary</li>
              <li>Select an algorithm for sampling locations</li>
            </ol>
          </CardContent>
        </Collapse>
      </Card>
    </>
  );
}
