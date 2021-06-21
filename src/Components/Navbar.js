import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Fade from '@material-ui/core/Fade';
//import MenuOpenIcon from "@material-ui/icons/MenuOpen";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function ButtonAppBar() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                {/* <MenuOpenIcon /> */}
            </IconButton>
            <Typography variant="h6" className={classes.title}>
                Main App
            </Typography>
            <Button color="inherit" aria-controls="fade-menu" aria-haspopup="true" onClick={handleClick}>
              Menu
            </Button> 
            <Menu
  id="fade-menu"
  anchorEl={anchorEl}
  keepMounted
  open={open}
  onClose={handleClose}
  TransitionComponent={Fade}
>
  <MenuItem onClick={handleClose}>Main App</MenuItem>
  <MenuItem onClick={handleClose}>About Us</MenuItem>
  <MenuItem onClick={handleClose}>References</MenuItem>
</Menu>
        </Toolbar>
      </AppBar>
    </div>
  );
}