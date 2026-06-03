"use client";
import { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import SideNav from "@/components/layout/SideNav";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SyncIcon from "@mui/icons-material/Sync";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const recentActivity = [
  {
    filename: "evidence_a14_src.jpg",
    time: "2 hours ago",
    status: "AI Generated" as const,
  },
  {
    filename: "IMG_8829_unverified.png",
    time: "Yesterday, 14:30",
    status: "Authentic" as const,
  },
  {
    filename: "screenshot_2024.webp",
    time: "Just now",
    status: "In Progress" as const,
  },
];

function StatusChip({ status }: { status: "AI Generated" | "Authentic" | "In Progress" }) {
  const config = {
    "AI Generated": {
      icon: <WarningAmberIcon sx={{ fontSize: 12 }} />,
      sx: { bgcolor: "rgba(248,113,113,0.12)", color: "#f87171", borderColor: "rgba(248,113,113,0.2)" },
    },
    Authentic: {
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 12 }} />,
      sx: { bgcolor: "rgba(52,211,153,0.1)", color: "#34d399", borderColor: "rgba(52,211,153,0.2)" },
    },
    "In Progress": {
      icon: <SyncIcon sx={{ fontSize: 12 }} />,
      sx: { bgcolor: "rgba(255,255,255,0.06)", color: "text.secondary", borderColor: "divider" },
    },
  };
  const { icon, sx } = config[status];
  return (
    <Chip
      icon={icon}
      label={status}
      size="small"
      variant="outlined"
      sx={{ fontSize: "0.7rem", height: 24, fontFamily: "var(--font-roboto), sans-serif", ...sx }}
    />
  );
}

export default function NewAnalysisPage() {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh" }}>
      <SideNav />

      <Box
        component="main"
        sx={{
          ml: "256px",
          flex: 1,
          p: { xs: 3, md: 6 },
          maxWidth: 1536,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Header */}
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "var(--font-playfair), serif",
              fontWeight: 700,
              color: "text.primary",
              mb: 1,
            }}
          >
            Start a New Analysis
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 640 }}>
            Deploy deep forensic inspection on suspicious media. Our ensemble models will analyze
            metadata, error level analysis, and generative artifacts.
          </Typography>
        </Box>

        {/* Upload Dropzone */}
        <Box
          onClick={() => inputRef.current?.click()}
          onDragEnter={() => setIsDragging(true)}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
          sx={{
            width: "100%",
            bgcolor: isDragging ? "rgba(138,92,246,0.06)" : "background.paper",
            border: "2px dashed",
            borderColor: isDragging ? "primary.main" : "divider",
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 12,
            px: 4,
            gap: 2,
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "rgba(138,92,246,0.04)",
              borderColor: "primary.dark",
            },
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "rgba(138,92,246,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
              transition: "transform 0.3s",
              "&:hover": { transform: "scale(1.1)" },
            }}
          >
            <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />
          </Box>

          <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="h6" sx={{ fontFamily: "var(--font-playfair), serif", color: "text.primary" }}>
              Drag and drop an image or click to browse
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Supports JPG, PNG, WEBP up to 20MB.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            sx={{ mt: 1 }}
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          >
            Select File
          </Button>

          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            style={{ display: "none" }}
          />
        </Box>

        {/* Recent Activity */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography
              variant="h6"
              sx={{ fontFamily: "var(--font-playfair), serif", color: "text.primary" }}
            >
              Recent Activity
            </Typography>
            <Typography
              component="a"
              href="/history"
              variant="caption"
              sx={{
                color: "primary.light",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.75rem",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              View All <ArrowForwardIcon sx={{ fontSize: 14 }} />
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {recentActivity.map((item) => (
              <Box
                key={item.filename}
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: "rgba(138,92,246,0.3)" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                    <ImageOutlinedIcon sx={{ fontSize: 20, color: "text.secondary", flexShrink: 0 }} />
                    <Typography
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        color: "text.primary",
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 140,
                      }}
                      title={item.filename}
                    >
                      {item.filename}
                    </Typography>
                  </Box>
                  <StatusChip status={item.status} />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: "auto",
                    pt: 1.5,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {item.time}
                  </Typography>
                  {item.status === "In Progress" ? (
                    <Box sx={{ width: 64, height: 4, bgcolor: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                      <Box
                        sx={{
                          height: "100%",
                          width: "66%",
                          bgcolor: "primary.main",
                          borderRadius: 2,
                          animation: "pulse 1.5s ease-in-out infinite",
                          "@keyframes pulse": {
                            "0%, 100%": { opacity: 1 },
                            "50%": { opacity: 0.5 },
                          },
                        }}
                      />
                    </Box>
                  ) : (
                    <Typography
                      component="button"
                      variant="caption"
                      sx={{
                        color: "primary.light",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "var(--font-roboto), sans-serif",
                        fontSize: "0.75rem",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      View Report
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}