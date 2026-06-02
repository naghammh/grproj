import React from "react";
import { Box, Typography } from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function SpecialistSideBarLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    cursor: "pointer",
    mb: 2,
    color: isActive(path) ? "primary.main" : "text.primary",
    fontWeight: isActive(path) ? "bold" : "normal",
    transition: "color 0.2s ease",
    "&:hover": {
      color: "primary.main",
    },
  });

  return (
    <Box
      display="flex"
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Box
        sx={{
          width: 240,
          bgcolor: "background.paper",
          color: "text.primary",
          p: 3,
          borderRight: "1px solid",
          borderColor: "divider",
          transition:
            "background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease",
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          mb={4}
          sx={{ color: "primary.main" }}
        >
          Nutrilife
        </Typography>

        <Typography
          sx={linkStyle("/SpecialistDashboard")}
          onClick={() => navigate("/specialistDashboard")}
        >
          Dashboard
        </Typography>

        <Typography
          sx={linkStyle("/specialistMessages")}
          onClick={() => navigate("/specialistMessages")}
        >
          Messages
        </Typography>

        <Typography
          sx={linkStyle("/plans")}
          onClick={() => navigate("/plans")}
        >
          Plans
        </Typography>

        <Typography
          sx={linkStyle("/clients")}
          onClick={() => navigate("/clients")}
        >
          Clients
        </Typography>

        <Typography
          sx={linkStyle("/programs")}
          onClick={() => navigate("/programs")}
        >
           Programs
        </Typography>

        <Typography
          sx={linkStyle("/appointments")}
          onClick={() => navigate("/appointments")}
        >
          Appointments
        </Typography>

        <Typography
          sx={linkStyle("/specialistRecipes")}
          onClick={() => navigate("/specialistRecipes")}
        >
          Recipes
        </Typography>

        

        <Typography
          sx={linkStyle("/specialistsettings")}
          onClick={() => navigate("/specialistsettings")}
        >
          Settings
        </Typography>

      </Box>

      <Box
        flex={1}
        p={4}
        sx={{
          bgcolor: "background.default",
          color: "text.primary",
          transition: "background-color 0.25s ease, color 0.25s ease",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
