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
  Typography
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import Logo1 from "../../assets/images/Logo1.png";
import aitool from "../../assets/images/aitool.png";

function Navbar() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };

  const navLinks = [
    { text: "Home", path: "/" },  
    { text: "About Us", path: "/about" },
    { text: "specialists", path: "/specialists" }
  ];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 5px 30px rgba(0, 0, 0, 0.35)"
              : "0 5px 30px rgba(0, 0, 0, 0.08)",
          transition:
            "background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease",
        }}
      >
        <Toolbar sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ flex: 1 }}>
  <Box
    component={Link}
    to="/"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 1,
      textDecoration: "none",
      color: "text.primary",
      "&:hover": {
        textDecoration: "none",
      },
    }}
  >
    <img src={Logo1} alt="Logo" height="50" />

    <Typography
      component="span"
      sx={{
        color: "text.primary",
        fontSize: 24,
        fontWeight: 400,
        textDecoration: "none",
      }}
    >
      NutriLife
    </Typography>
  </Box>
</Box>


          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 3,
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            {navLinks.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                sx={{
                  color: "text.primary",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  "&:hover": {
                    color: "primary.main",
                    bgcolor: "transparent",
                  },
                }}
              >
                {item.text}
              </Button>
            ))}

            <Box
              component={Link}
              to="/ai-tool"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                px: 1.5,
                py: 0.5,
                borderRadius: 999,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(46, 125, 50, 0.18)"
                    : "rgba(46, 125, 50, 0.08)",
              }}
            >
              <img src={aitool} alt="AI Tool" height="30" />
            </Box>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 2,
              justifyContent: "flex-end",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Button
              component={Link}
              to="/login"
              sx={{
                color: "text.primary",
                fontWeight: 700,
                "&:hover": {
                  color: "primary.main",
                  bgcolor: "transparent",
                },
              }}
            >
              Login
            </Button>

            <Button
              component={Link}
              to="/register"
              variant="contained"
              sx={{
                bgcolor: "primary.main",
                color: "#fff",
                fontWeight: 700,
                px: 3,
                "&:hover": {
                  bgcolor: "#1b5e20",
                },
              }}
            >
              Sign Up
            </Button>
          </Box>

          <IconButton
            edge="end"
            sx={{
              display: { md: "none" },
              color: "text.primary",
            }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
          },
        }}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
        >
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
              <ListItemButton component={Link} to="/register">
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
