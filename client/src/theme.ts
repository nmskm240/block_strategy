import { createTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

type AppPaletteCustom = {
  surface: {
    base: string;
    subtle: string;
  };
  border: {
    subtle: string;
    default: string;
    strong: string;
  };
  text: {
    muted: string;
    faint: string;
  };
  action: {
    fabBg: string;
    fabHoverBg: string;
    addNodeFabBg: string;
    addNodeFabHoverBg: string;
    primaryButtonBg: string;
    primaryButtonHoverBg: string;
    primaryButtonBorder: string;
  };
  chart: {
    axisText: string;
    grid: string;
    axisLine: string;
    tooltipBg: string;
    tooltipBorder: string;
    tooltipText: string;
    line: string;
    activeDotStroke: string;
  };
  overlay: {
    loadingBackdrop: string;
    loadingText: string;
    tourPrimary: string;
  };
};

declare module "@mui/material/styles" {
  interface Palette {
    custom: AppPaletteCustom;
  }

  interface PaletteOptions {
    custom?: AppPaletteCustom;
  }
}

export const appTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      light: "#93c5fd",
      main: "#2563eb",
      dark: "#1d4ed8",
      contrastText: "#ffffff",
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
    divider: "rgba(148,163,184,0.16)",
    custom: {
      surface: {
        base: "#111724",
        subtle: "#0f1624",
      },
      border: {
        subtle: "rgba(148,163,184,0.16)",
        default: "rgba(148,163,184,0.28)",
        strong: "rgba(148,163,184,0.4)",
      },
      text: {
        muted: "rgba(255,255,255,0.72)",
        faint: "rgba(255,255,255,0.56)",
      },
      action: {
        fabBg: "#3a4aa8",
        fabHoverBg: "#4658bf",
        addNodeFabBg: "#334155",
        addNodeFabHoverBg: "#475569",
        primaryButtonBg: "#3a4aa8",
        primaryButtonHoverBg: "#4658bf",
        primaryButtonBorder: "#2c387f",
      },
      chart: {
        axisText: "#94a3b8",
        grid: "rgba(255,255,255,0.08)",
        axisLine: "rgba(148,163,184,0.16)",
        tooltipBg: "#0f1624",
        tooltipBorder: "1px solid rgba(148,163,184,0.16)",
        tooltipText: "#f5f7fb",
        line: "#93c5fd",
        activeDotStroke: "#dbeafe",
      },
      overlay: {
        loadingBackdrop: "rgba(11, 15, 23, 0.72)",
        loadingText: "rgba(255,255,255,0.72)",
        tourPrimary: "#2563eb",
      },
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
    MuiButton: {
      styleOverrides: {
        outlined: ({ theme }) => ({
          color: theme.palette.text.primary,
          borderColor: theme.palette.custom.border.default,
          "&:hover": {
            borderColor: theme.palette.custom.border.strong,
            backgroundColor: "rgba(148,163,184,0.08)",
          },
        }),
        contained: ({ theme }) => ({
          ...(theme.palette.mode === "dark" && {
            boxShadow: "none",
          }),
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.custom.surface.base,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.custom.border.subtle}`,
          borderRadius: Number(theme.shape.borderRadius) * 1.5,
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
        }),
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.custom.surface.base,
          border: `1px solid ${theme.palette.custom.border.subtle}`,
          color: theme.palette.text.primary,
        }),
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.custom.surface.subtle,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.custom.border.subtle}`,
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.primary,
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.custom.border.default,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.custom.border.strong,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: ({ theme }) => ({
          color: theme.palette.text.primary,
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        outlinedError: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.error.main, 0.08),
          color: "#ffd7d7",
          borderColor: alpha(theme.palette.error.main, 0.35),
          ".MuiAlert-icon": {
            color: theme.palette.error.light,
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderColor: theme.palette.custom.border.subtle,
        }),
      },
    },
    MuiCard: {
      variants: [
        {
          props: { variant: "outlined" },
          style: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderColor: theme.palette.custom.border.subtle,
          }),
        },
      ],
    },
  },
});

export const appPaletteCustom = appTheme.palette.custom;
