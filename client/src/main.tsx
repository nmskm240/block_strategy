import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@/index.css";
import App from "@/App";
import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";

const container = document.getElementById("root");
const root = createRoot(container!);
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
    background: {
      default: "#0b0f17",
      paper: "#111724",
    },
    text: {
      primary: "#f5f7fb",
      secondary: "rgba(255,255,255,0.72)",
      disabled: "rgba(255,255,255,0.42)",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    allVariants: {
      color: "#f5f7fb",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          color: "#f5f7fb",
          backgroundColor: "#0b0f17",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "rgba(255,255,255,0.72)",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: "rgba(255,255,255,0.72)",
        },
      },
    },
  },
});

root.render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
