"use client";

import React, { useState } from "react";
import { Box, Typography, Container, Paper, Button } from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

export default function AnalysisPage() {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file drop
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          New Forensic Analysis
        </Typography>
        <Typography color="text.secondary">
          Upload an image to detect AI manipulation and extract metadata.
        </Typography>
      </Box>

      <Paper
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          p: 8,
          textAlign: "center",
          bgcolor: dragActive ? "rgba(138,92,246,0.05)" : "background.paper",
          border: "2px dashed",
          borderColor: dragActive ? "primary.main" : "divider",
          borderRadius: 4,
          transition: "all 0.2s ease-in-out",
          cursor: "pointer",
        }}
      >
        <Box sx={{ color: "primary.main", mb: 2 }}>
          <CloudUploadOutlinedIcon sx={{ fontSize: 64 }} />
        </Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Drag and drop your image here
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Supported formats: JPEG, PNG, WEBP (Max 10MB)
        </Typography>
        <Button variant="contained" disableElevation component="label">
          Browse Files
          <input type="file" hidden accept="image/*" />
        </Button>
      </Paper>
    </Container>
  );
}
