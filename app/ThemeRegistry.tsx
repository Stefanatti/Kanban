"use client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    primary: {
      main: "#635FC7",
    },
    error: {
      main: "#EA5555",
    },
    text: {
      primary: "#000112",
    },
    background: {
      default: "#F4F7FD",
    },
  },
  typography: {
    fontFamily: "var(--font-plus-jakarta), sans-serif",
    h1: { color: "#000112" },
    h2: { color: "#000112" },
    h3: { color: "#000112" },
    h4: { color: "#000112" },
    h5: { color: "#000112" },
    h6: { color: "#000112" },
  },
});

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
