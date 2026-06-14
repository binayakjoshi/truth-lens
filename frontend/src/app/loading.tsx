"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loading() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#0c0c0e",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient background glow */}
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(138,92,246,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Spinner container with pulse ring */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 4,
        }}
      >
        {/* Outer pulse ring */}
        <Box
          sx={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "1.5px solid rgba(138,92,246,0.3)",
            animation: "pulseRing 2s ease-in-out infinite",
            "@keyframes pulseRing": {
              "0%": {
                transform: "scale(1)",
                opacity: 0.6,
              },
              "50%": {
                transform: "scale(1.4)",
                opacity: 0,
              },
              "100%": {
                transform: "scale(1)",
                opacity: 0,
              },
            },
          }}
        />

        {/* Second pulse ring (offset timing) */}
        <Box
          sx={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "1.5px solid rgba(138,92,246,0.2)",
            animation: "pulseRing2 2s ease-in-out 0.6s infinite",
            "@keyframes pulseRing2": {
              "0%": {
                transform: "scale(1)",
                opacity: 0.4,
              },
              "50%": {
                transform: "scale(1.6)",
                opacity: 0,
              },
              "100%": {
                transform: "scale(1)",
                opacity: 0,
              },
            },
          }}
        />

        <CircularProgress
          size={48}
          thickness={3}
          sx={{
            color: "#8a5cf6",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />
      </Box>

      {/* Brand text with fade-in */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: "#f5f0e8",
          animation: "fadeInUp 0.8s ease-out",
          "@keyframes fadeInUp": {
            "0%": {
              opacity: 0,
              transform: "translateY(8px)",
            },
            "100%": {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
        }}
      >
        TruthLens
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mt: 1,
          color: "rgba(245,240,232,0.4)",
          fontFamily: "var(--font-roboto), sans-serif",
          letterSpacing: "0.08em",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          animation: "fadeInUp 0.8s ease-out 0.15s both",
        }}
      >
        Loading…
      </Typography>
    </Box>
  );
}
