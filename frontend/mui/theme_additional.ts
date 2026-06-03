// ─────────────────────────────────────────────────────────────
// ADD THESE to your existing theme.ts inside createTheme({})
// Just paste these alongside your existing palette/components
// ─────────────────────────────────────────────────────────────

// 1. In your `palette`, add the missing error color variant:
//    error: { main: "#f87171" },   ← already there ✅
//    Just confirm this line exists.

// 2. Add MuiSlider override inside `components: {}`:

MuiSlider: {
  styleOverrides: {
    root: {
      color: "#8a5cf6",
      height: 4,
      "& .MuiSlider-thumb": {
        width: 16,
        height: 16,
        backgroundColor: "#8a5cf6",
        border: "2px solid #0c0c0e",
        "&:hover": {
          boxShadow: "0 0 0 6px rgba(138,92,246,0.16)",
        },
      },
      "& .MuiSlider-track": {
        border: "none",
        backgroundColor: "#8a5cf6",
      },
      "& .MuiSlider-rail": {
        backgroundColor: "rgba(255,255,255,0.08)",
      },
    },
  },
},

// 3. Add MuiSelect override inside `components: {}`:

MuiSelect: {
  styleOverrides: {
    root: ({ theme }: { theme: Theme }) => ({
      color: theme.palette.text.primary,
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.divider,
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.dark,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
    }),
  },
},

MuiMenu: {
  styleOverrides: {
    paper: ({ theme }: { theme: Theme }) => ({
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
    }),
  },
},

MuiMenuItem: {
  styleOverrides: {
    root: ({ theme }: { theme: Theme }) => ({
      color: theme.palette.text.primary,
      fontFamily: "var(--font-roboto), sans-serif",
      fontSize: "0.875rem",
      "&:hover": {
        backgroundColor: "rgba(138,92,246,0.08)",
      },
      "&.Mui-selected": {
        backgroundColor: "rgba(138,92,246,0.12)",
        "&:hover": {
          backgroundColor: "rgba(138,92,246,0.16)",
        },
      },
    }),
  },
},