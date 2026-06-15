"use client";

import React from "react";

import { Box, Typography, Container, Paper } from "@mui/material";

export default function HistoryPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Analysis History
        </Typography>
        <Typography color="text.secondary">
          Review your past forensic reports and findings.
        </Typography>
      </Box>

      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          bgcolor: "background.paper",
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography color="text.disabled">No history available yet.</Typography>
      </Paper>
    </Container>
  );
}
