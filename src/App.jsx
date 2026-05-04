import React, { createContext, useMemo, useState } from "react";
import router from "./routes";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

export const ThemeModeContext = createContext({
  darkMode: false,
  onThemeToggle: () => {},
});

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: "#2e7d32",
          },
          background: {
            default: darkMode ? "#101510" : "#f6faf6",
            paper: darkMode ? "#182018" : "#ffffff",
          },
          text: {
            primary: darkMode ? "#f4f7f4" : "#172017",
            secondary: darkMode ? "#b8c6b8" : "#5f6f5f",
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: darkMode ? "#101510" : "#f6faf6",
                color: darkMode ? "#f4f7f4" : "#172017",
                transition: "background-color 0.25s ease, color 0.25s ease",
              },
              "#root": {
                minHeight: "100vh",
                backgroundColor: darkMode ? "#101510" : "#f6faf6",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                transition:
                  "background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease",
              },
            },
          },
        },
      }),
    [darkMode]
  );

  const handleThemeToggle = (checked) => {
    setDarkMode(checked);
    localStorage.setItem("darkMode", checked);
  };

  return (
    <ThemeModeContext.Provider
      value={{ darkMode, onThemeToggle: handleThemeToggle }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
