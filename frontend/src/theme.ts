"use client";
import { createTheme, type Theme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: {
      main: "#8a5cf6",
      light: "#c084fc",
      dark: "#7c3aed",
      contrastText: "#ffffff",
    },
    background: {
      default: "#0c0c0e",
      paper: "#111114",
    },
    text: {
      primary: "#f5f0e8",
      secondary: "rgba(245,240,232,0.45)",
      disabled: "rgba(245,240,232,0.25)",
    },
    error: { main: "#f87171" },
    divider: "rgba(255,255,255,0.08)",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "var(--font-playfair), serif",
    body1: { fontFamily: "var(--font-roboto), sans-serif" },
    body2: { fontFamily: "var(--font-roboto), sans-serif" },
    caption: { fontFamily: "var(--font-roboto), sans-serif" },
  },
  components: {
    MuiTextField: {
      defaultProps: { variant: "outlined", fullWidth: true },
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255,255,255,0.03)",
            color: theme.palette.text.primary,
            "& fieldset": { borderColor: theme.palette.divider },
            "&:hover fieldset": { borderColor: theme.palette.primary.light },
            "&.Mui-focused fieldset": {
              borderColor: theme.palette.primary.main,
            },
          },
          "& .MuiInputLabel-root": {
            color: theme.palette.text.secondary,
            fontFamily: "var(--font-roboto), sans-serif",
            "&.Mui-focused": { color: theme.palette.primary.light },
          },
          "& .MuiFormHelperText-root": {
            color: theme.palette.error.main,
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        // Fix 1: 'root' for base styles, typed theme param
        root: ({ theme }: { theme: Theme }) => ({
          textTransform: "none" as const,
          fontFamily: "var(--font-playfair), serif",
          fontWeight: 600,
          fontSize: "0.95rem",
          letterSpacing: "0.02em",
          borderRadius: theme.shape.borderRadius,
          paddingTop: 12,
          paddingBottom: 12,
        }),
      },
      // Fix 2: variant-specific styles go in the `variants` array, not styleOverrides
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: ({ theme }: { theme: Theme }) => ({
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            boxShadow: `0 4px 24px rgba(138,92,246,0.35)`,
            "&:hover": {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              boxShadow: `0 6px 30px rgba(138,92,246,0.5)`,
            },
            "&.Mui-disabled": {
              background: "rgba(255,255,255,0.06)",
              color: theme.palette.text.disabled,
            },
          }),
        },
      ],
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          color: theme.palette.primary.light,
          fontFamily: "var(--font-roboto), sans-serif",
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          color: theme.palette.text.secondary,
        }),
      },
    },
  },
});

export default theme;
