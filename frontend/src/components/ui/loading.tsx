"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

type LoadingProps = {
  text?: string;
};

export default function LoadingOverlay({ text = "Loading…" }: LoadingProps) {
  return (
    <Box
      sx={{
        minHeight: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
        py: 8,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(var(--mui-palette-primary-mainChannel) / 0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 4,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: "50%",
            border:
              "1.5px solid rgba(var(--mui-palette-primary-lightChannel) / 0.3)",
            animation: "pulseRing 2s ease-in-out infinite",
            "@keyframes pulseRing": {
              "0%": { transform: "scale(1)", opacity: 0.6 },
              "50%": { transform: "scale(1.4)", opacity: 0 },
              "100%": { transform: "scale(1)", opacity: 0 },
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: "50%",
            border:
              "1.5px solid rgba(var(--mui-palette-primary-lightChannel) / 0.2)",
            animation: "pulseRing2 2s ease-in-out 0.6s infinite",
            "@keyframes pulseRing2": {
              "0%": { transform: "scale(1)", opacity: 0.4 },
              "50%": { transform: "scale(1.6)", opacity: 0 },
              "100%": { transform: "scale(1)", opacity: 0 },
            },
          }}
        />
        <CircularProgress
          size={48}
          thickness={3}
          sx={{
            color: "primary.main",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          letterSpacing: "0.08em",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          animation: "fadeInUp 0.8s ease-out 0.15s both",
          "@keyframes fadeInUp": {
            "0%": { opacity: 0, transform: "translateY(8px)" },
            "100%": { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
