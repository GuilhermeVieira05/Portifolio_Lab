import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { adminTheme } from "./adminTheme";

/**
 * Wraps every /admin/* route in its own dark MUI theme + CssBaseline. The
 * public site has a dark background baked into index.css's :root but relies
 * on the default light MUI palette for its own components; CssBaseline here
 * resets that inherited body background so admin form fields render with
 * correct (light-on-dark) contrast instead of dark text on a dark page.
 */
export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={adminTheme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);
