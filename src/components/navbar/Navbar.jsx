import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import Logo from "../../assets/images/Logo.png";
import aitool from "../../assets/images/aitool.png";

function Navbar() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };

  const navLinks = [
    { text: "Home", path: "/" },
    { text: "Specialists", path: "/specialists" },
    { text: "About Us", path: "/about" },
  ];

  return (
    <>
<AppBar
  position="sticky"
  color="inherit"
  elevation={0} 
  sx={{
    boxShadow: "0 5px 30px rgba(0, 0, 0, 0.1)" // ظل خفيف من تحت فقط
  }}
>        <Toolbar sx={{ display: "flex", alignItems: "center" }}>
  
  {/* Left - Logo */}
  <Box sx={{ flex: 1 }}>
    <Box component={Link} to="/">
      <img src={Logo} alt="Logo" height="50" />
    </Box>
  </Box>

  {/* Center - Nav Links */}
  <Box
    sx={{
      display: { xs: "none", md: "flex" },
      gap: 3,
      justifyContent: "center",
      flex: 1,
    }}
  >
    {navLinks.map((item) => (
      <Button
        key={item.text}
        component={Link}
        to={item.path}
        color="inherit"
      >
        {item.text}
      </Button>
    ))}

    {/* AI Tool Image */}
    <Box component={Link} to="/ai-tool">
      <img src={aitool} alt="AI Tool" height="30" />
    </Box>
  </Box>

  {/* Right - Auth Buttons */}
  <Box
    sx={{
      display: { xs: "none", md: "flex" },
      gap: 2,
      justifyContent: "flex-end",
      flex: 1,
    }}
  >
    <Button component={Link} to="/login" color="inherit">
      Login
    </Button>

    <Button
      component={Link}
      to="/register"
      variant="contained"
      color="success"
    >
      Sign Up
    </Button>
  </Box>

  {/* Mobile Menu Button */}
  <IconButton
    edge="end"
    color="inherit"
    sx={{ display: { md: "none" } }}
    onClick={toggleDrawer(true)}
  >
    <MenuIcon />
  </IconButton>
</Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            {navLinks.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.path}>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/login">
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/signup">
                <ListItemText primary="Sign Up" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default Navbar;