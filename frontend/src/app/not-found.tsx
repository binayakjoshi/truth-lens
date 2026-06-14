"use client";

import Link from "next/link";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { Box, Button, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#0c0c0e",
        color: "#f5f0e8",
        position: "relative",
        overflow: "hidden",
        px: 3,
      }}
    >
      {/* Ambient background glow */}
      <Box
        sx={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(138,92,246,0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
          top: "20%",
        }}
      />

      {/* Icon */}
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 3,
          bgcolor: "rgba(138,92,246,0.08)",
          border: "1px solid rgba(138,92,246,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SearchOffIcon sx={{ fontSize: 40, color: "#8a5cf6", opacity: 0.8 }} />
      </Box>

      {/* 404 number */}
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: "7rem", sm: "9rem", md: "11rem" },
          fontWeight: 800,
          lineHeight: 1,
          background:
            "linear-gradient(135deg, #8a5cf6 0%, #c084fc 50%, #8a5cf6 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.04em",
          position: "relative",
          userSelect: "none",
        }}
      >
        404
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="h5"
        sx={{
          mt: 1,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "#f5f0e8",
        }}
      >
        Page not found
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mt: 1.5,
          mb: 4,
          color: "rgba(245,240,232,0.45)",
          fontFamily: "var(--font-roboto), sans-serif",
          textAlign: "center",
          maxWidth: 380,
          lineHeight: 1.6,
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </Typography>

      {/* Back button */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          sx={{ px: 4, py: 1.5 }}
        >
          Back to Home
        </Button>
      </Link>

      {/* Decorative scan line */}
      <Box
        sx={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 1,
            bgcolor: "rgba(138,92,246,0.25)",
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: "rgba(245,240,232,0.25)",
            fontFamily: "var(--font-roboto), sans-serif",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontSize: "0.65rem",
          }}
        >
          TruthLens Forensics
        </Typography>
        <Box
          sx={{
            width: 32,
            height: 1,
            bgcolor: "rgba(138,92,246,0.25)",
          }}
        />
      </Box>
    </Box>
  );
}
