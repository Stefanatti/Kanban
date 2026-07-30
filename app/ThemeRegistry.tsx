"use client";
import { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useThemeMode } from "./ThemeContext";

const sharedTypography = {
  fontFamily: "var(--font-plus-jakarta), sans-serif",
  h1: { fontWeight: 700, fontSize: "24px", lineHeight: "30px" },
  h2: { fontWeight: 700, fontSize: "18px", lineHeight: "23px" },
  h3: { fontWeight: 700, fontSize: "15px", lineHeight: "19px" },
  h4: {
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "15px",
    letterSpacing: "2.4px",
  },
  h5: { fontWeight: 700, fontSize: "18px", lineHeight: "23px" },
  h6: { fontWeight: 700, fontSize: "15px", lineHeight: "19px" },
  body1: { fontWeight: 500, fontSize: "13px", lineHeight: "23px" },
  body2: { fontWeight: 700, fontSize: "12px", lineHeight: "15px" },
  subtitle1: {
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "15px",
    letterSpacing: "2.4px",
  },
  subtitle2: { fontWeight: 700, fontSize: "12px", lineHeight: "15px" },
  button: {
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: "23px",
    textTransform: "none" as const,
  },
};

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#635FC7" },
    error: { main: "#EA5555" },
    text: { primary: "#000112" },
    background: { default: "#F4F7FD", paper: "#FFFFFF" },
  },
  typography: sharedTypography,
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#635FC7" },
    error: { main: "#EA5555" },
    text: { primary: "#FFFFFF" },
    background: { default: "#20212C", paper: "#2B2C37" },
  },
  typography: sharedTypography,
});

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mode } = useThemeMode();
  const theme = useMemo(
    () => (mode === "dark" ? darkTheme : lightTheme),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
