import { createTheme, type Theme } from "@mui/material/styles";

import { type ThemeMode } from "@/lib/theme-cookie";

const sharedTokens = {
  primary: {
    main: "#f59e0b",
    light: "#fbbf24",
    dark: "#d97706",
    contrastText: "#1c1507",
  },
  error: { main: "#f87171" },
  shape: { borderRadius: 10 },
};

const palettes: Record<
  ThemeMode,
  {
    mode: ThemeMode;
    background: { default: string; paper: string };
    text: { primary: string; secondary: string; disabled: string };
    divider: string;
    inputBg: string;
    disabledButtonBg: string;
  }
> = {
  dark: {
    mode: "dark",
    background: { default: "#0e0c08", paper: "#141008" },
    text: {
      primary: "#fdf8f0",
      secondary: "rgba(253,248,240,0.45)",
      disabled: "rgba(253,248,240,0.25)",
    },
    divider: "rgba(255,255,255,0.08)",
    inputBg: "rgba(255,255,255,0.03)",
    disabledButtonBg: "rgba(255,255,255,0.06)",
  },
  light: {
    mode: "light",
    background: { default: "#fdfaf4", paper: "#ffffff" },
    text: {
      primary: "#1c1507",
      secondary: "rgba(28,21,7,0.55)",
      disabled: "rgba(28,21,7,0.35)",
    },
    divider: "rgba(0,0,0,0.08)",
    inputBg: "rgba(0,0,0,0.02)",
    disabledButtonBg: "rgba(0,0,0,0.06)",
  },
};

export function createAppTheme(mode: ThemeMode) {
  const tokens = palettes[mode];

  return createTheme({
    cssVariables: true,
    palette: {
      mode: tokens.mode,
      primary: sharedTokens.primary,
      background: tokens.background,
      text: tokens.text,
      error: sharedTokens.error,
      divider: tokens.divider,
    },
    shape: sharedTokens.shape,
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
              backgroundColor: tokens.inputBg,
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
              "&.Mui-focused": { color: theme.palette.primary.main },
            },
            "& .MuiFormHelperText-root": {
              color: theme.palette.error.main,
            },
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
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
        variants: [
          {
            props: { variant: "contained", color: "primary" },
            style: ({ theme }: { theme: Theme }) => ({
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              color: sharedTokens.primary.contrastText,
              boxShadow: "0 4px 24px rgba(245,158,11,0.35)",
              "&:hover": {
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                boxShadow: "0 6px 30px rgba(245,158,11,0.5)",
              },
              "&.Mui-disabled": {
                background: tokens.disabledButtonBg,
                color: theme.palette.text.disabled,
              },
            }),
          },
        ],
      },
      MuiLink: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            color: theme.palette.primary.main,
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
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }: { theme: Theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            backgroundImage: "none",
          }),
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            "& .MuiAlert-root": {
              width: "100%",
            },
          },
        },
      },
    },
  });
}

const theme = createAppTheme("light");

export default theme;
