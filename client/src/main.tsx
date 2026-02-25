import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@/index.css";
import App from "@/App";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { appTheme } from "@/theme";
import { installStringExtensions } from "shared";

const container = document.getElementById("root");
const root = createRoot(container!);
installStringExtensions();
root.render(
  <StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
