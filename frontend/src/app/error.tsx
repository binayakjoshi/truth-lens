"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box, Button, Dialog, Typography } from "@mui/material";

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

  const router = useRouter();
  const hasMessage = Boolean(error.message);

  return (
    <Dialog
      open
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            outline: "none",
            borderRadius: 3,
            bgcolor: "background.paper",
            color: "text.primary",
            p: 4,
            textAlign: "center",
          },
        },
      }}
    >
      <Box
        sx={{
          mx: "auto",
          mb: 2.5,
          width: 64,
          height: 64,
          borderRadius: 3,
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ReportProblemOutlinedIcon sx={{ fontSize: 32, color: "error.main" }} />
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Something went wrong
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: "text.secondary", lineHeight: 1.6, mb: 3 }}
      >
        {hasMessage
          ? error.message
          : "An unexpected error occurred while processing your request. You can try again or return to the home page."}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          justifyContent: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/")}
          sx={{
            height: 45,
          }}
        >
          Back to Home
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={reset}
          sx={{
            height: 45,
          }}
        >
          Try Again
        </Button>
      </Box>
    </Dialog>
  );
}
