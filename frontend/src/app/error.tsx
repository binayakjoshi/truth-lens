"use client";

import { useEffect } from "react";

import Link from "next/link";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box, Button, Typography } from "@mui/material";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

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
      {/* Ambient background glow — red-tinted for error */}
      <Box
        sx={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(248,113,113,0.08) 0%, rgba(138,92,246,0.06) 40%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Error icon */}
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 3,
          bgcolor: "rgba(248,113,113,0.08)",
          border: "1px solid rgba(248,113,113,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ReportProblemOutlinedIcon
          sx={{ fontSize: 40, color: "#f87171", opacity: 0.9 }}
        />
      </Box>

      {/* Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          letterSpacing: "-0.01em",
          mb: 1,
        }}
      >
        Something went wrong
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "rgba(245,240,232,0.45)",
          fontFamily: "var(--font-roboto), sans-serif",
          textAlign: "center",
          maxWidth: 420,
          lineHeight: 1.6,
          mb: 1.5,
        }}
      >
        An unexpected error occurred while processing your request. You can try
        again or return to the home page.
      </Typography>

      {/* Error detail card */}
      <Box
        sx={{
          mt: 1,
          mb: 4,
          px: 3,
          py: 2,
          borderRadius: 2,
          bgcolor: "rgba(248,113,113,0.06)",
          border: "1px solid rgba(248,113,113,0.12)",
          maxWidth: 480,
          width: "100%",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "rgba(248,113,113,0.7)",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            letterSpacing: "0.04em",
            display: "block",
            mb: 0.5,
            textTransform: "uppercase",
          }}
        >
          Error details
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(245,240,232,0.6)",
            fontFamily: "var(--font-roboto), sans-serif",
            fontSize: "0.85rem",
            wordBreak: "break-word",
          }}
        >
          {error.message || "An unknown error occurred."}
        </Typography>
      </Box>

      {/* Action buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={reset}
          sx={{ px: 4, py: 1.5 }}
        >
          Try Again
        </Button>

        <Link href="/" style={{ textDecoration: "none" }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{
              px: 4,
              py: 1.5,
              borderColor: "rgba(255,255,255,0.12)",
              color: "#f5f0e8",
              "&:hover": {
                borderColor: "rgba(138,92,246,0.4)",
                bgcolor: "rgba(138,92,246,0.06)",
              },
            }}
          >
            Back to Home
          </Button>
        </Link>
      </Box>

      {/* Decorative footer */}
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
