"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import SideNav from "@/components/layout/SideNav";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import RadarOutlinedIcon from "@mui/icons-material/RadarOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import SubjectIcon from "@mui/icons-material/Subject";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";

export default function AnalysisResultPage() {
  const [heatmapOpacity, setHeatmapOpacity] = useState(80);

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh" }}>
      <SideNav />

      <Box
        component="main"
        sx={{ ml: "256px", flex: 1, p: { xs: 3, md: 6 }, bgcolor: "background.default", minHeight: "100vh" }}
      >
        <Box sx={{ maxWidth: 1280, mx: "auto" }}>

          {/* Page Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              mb: 4,
              pb: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.7rem" }}>
                  Analysis Result
                </Typography>
                <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "divider" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.75rem", color: "text.secondary" }}>
                  ID: #TL-8829-X
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ fontFamily: "var(--font-playfair), serif", fontWeight: 700, color: "text.primary" }}
              >
                Forensic Report: profile_img_v2.jpg
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<DownloadOutlinedIcon />}
              sx={{ borderColor: "divider", color: "text.primary", "&:hover": { borderColor: "primary.main" } }}
            >
              Export PDF
            </Button>
          </Box>

          {/* 3-Column Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" },
              gap: 3,
              mb: 3,
            }}
          >
            {/* Column 1: Input Image */}
            <Box
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: "rgba(255,255,255,0.02)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.primary", fontWeight: 600, fontSize: "0.8rem" }}
                >
                  <ImageOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  Input
                </Typography>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.75rem", color: "text.secondary" }}>
                  1024x1024 px
                </Typography>
              </Box>

              <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: 1.5,
                    overflow: "hidden",
                    bgcolor: "rgba(255,255,255,0.04)",
                    border: "1px solid",
                    borderColor: "divider",
                    mb: 2,
                  }}
                >
                  <Box
                    component="img"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAt5MUJdEiVfvkDRc5w580oW85BD34ddaPmhij6WVhr-OphLJYPeV1RuyKtWEbGEKRrOjdVGO4kRv9-cs1LefvXj4lX58zU0S1O5fyQmxJktAlBhN_vXsfKO9vYpE05I8aJwl1NB7ROSVr4cE70nbohYjze3WPucAOzO16gcJkG8gQJiqpsH5ACsAMDfVAC7nZVXdhZpg0dtIphboljjjenRxrur7IA3XgKJAm5FLFbFLd_Qb82uBxo_PZz673mN4DH852TUtn65g"
                    alt="Original uploaded portrait"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
                <Box sx={{ mt: "auto" }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                    Source Hash (SHA-256):
                  </Typography>
                  <Box
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      color: "text.primary",
                      bgcolor: "rgba(255,255,255,0.03)",
                      p: 1.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      wordBreak: "break-all",
                    }}
                  >
                    8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Column 2: Heatmap */}
            <Box
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: "rgba(255,255,255,0.02)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.primary", fontWeight: 600, fontSize: "0.8rem" }}
                >
                  <RadarOutlinedIcon sx={{ fontSize: 18, color: "error.main" }} />
                  Reasoning
                </Typography>
                <Box
                  sx={{
                    bgcolor: "rgba(255,255,255,0.05)",
                    color: "text.secondary",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 0.5,
                    fontSize: "0.7rem",
                    fontFamily: "monospace",
                  }}
                >
                  Grad-CAM
                </Box>
              </Box>

              <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: 1.5,
                    overflow: "hidden",
                    bgcolor: "rgba(255,255,255,0.04)",
                    border: "1px solid",
                    borderColor: "divider",
                    mb: 2,
                  }}
                >
                  <Box
                    component="img"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7zBOVpCmVoOs2vB9TUqPDQRMI7lSXkiOoa3hRG6XqrgnqeJo08LeCNVTo9bL2M-rVEZvK15lmjqFU4dVvdhTQdRCUOO3OzqptF6w7Yf2SMNmR7uueVgkyV8a9SBGjPioWZ5OQNhmrPnIX3QRAvYV7cNHViLb825qOEAu77BFYzoYMsNzYVw381uXjVj_v1KYy0IyeGImC171_N-2bZ6OrWENceUM0gqVh6Gzk-gCu520Qb6ZSD4uOK-Aq4XfjFywHAIG9gdqWzb0"
                    alt="Heatmap base"
                    sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1)", opacity: 0.5 }}
                  />
                  {/* Heatmap overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top right, transparent, rgba(239,68,68,0.4), rgba(250,204,21,0.6))",
                      mixBlendMode: "multiply",
                      opacity: heatmapOpacity / 100,
                      transition: "opacity 0.2s",
                    }}
                  />
                  {/* Reticles */}
                  <Box sx={{ position: "absolute", top: "33%", left: "33%", width: 64, height: 64, border: "1px solid rgba(239,68,68,0.5)", borderRadius: "50%", animation: "pulse 2s ease-in-out infinite", "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.4 } } }} />
                  <Box sx={{ position: "absolute", top: "25%", right: "25%", width: 80, height: 80, border: "1px solid rgba(250,204,21,0.5)", borderRadius: "50%" }} />
                </Box>

                <Box
                  sx={{
                    mt: "auto",
                    bgcolor: "rgba(255,255,255,0.03)",
                    p: 1.5,
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Heatmap Opacity
                    </Typography>
                    <Typography sx={{ fontFamily: "monospace", fontSize: "0.75rem", color: "primary.light" }}>
                      {heatmapOpacity}%
                    </Typography>
                  </Box>
                  <Slider
                    value={heatmapOpacity}
                    onChange={(_, v) => setHeatmapOpacity(v as number)}
                    min={0}
                    max={100}
                    size="small"
                    sx={{ color: "primary.main", py: 0.5 }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Column 3: Verdict */}
            <Box
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: "rgba(255,255,255,0.02)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.primary", fontWeight: 600, fontSize: "0.8rem" }}
                >
                  <GavelOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  Verdict
                </Typography>
              </Box>

              <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                {/* Circular progress */}
                <Box sx={{ position: "relative", width: 160, height: 160, mb: 2 }}>
                  <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                    <circle
                      cx="80" cy="80" r="70"
                      fill="transparent"
                      stroke="#8a5cf6"
                      strokeWidth="12"
                      strokeDasharray="439.82"
                      strokeDashoffset={439.82 * (1 - 0.984)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <Typography sx={{ fontFamily: "var(--font-playfair), serif", fontWeight: 900, fontSize: "1.75rem", color: "text.primary", lineHeight: 1 }}>
                      98.4<span style={{ fontSize: "1rem" }}>%</span>
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Confidence
                    </Typography>
                  </Box>
                </Box>

                {/* Badge */}
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: "primary.main",
                    color: "white",
                    px: 3,
                    py: 1,
                    borderRadius: "999px",
                    mb: 4,
                    boxShadow: "0 2px 16px rgba(138,92,246,0.4)",
                  }}
                >
                  <SmartToyOutlinedIcon sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontFamily: "var(--font-roboto), sans-serif", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    AI Generated
                  </Typography>
                </Box>

                {/* Metadata */}
                <Box sx={{ width: "100%", mt: "auto", borderTop: "1px solid", borderColor: "divider", pt: 2, textAlign: "left" }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.65rem", display: "block", mb: 1.5 }}>
                    Execution Metadata
                  </Typography>
                  {[
                    { label: "Processing Time", value: "1.2s" },
                    { label: "Detection Model", value: "TruthLens v4.2" },
                    { label: "Resolution", value: "4K (Interpolated)" },
                  ].map((item, i, arr) => (
                    <Box
                      key={item.label}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1,
                        borderBottom: i < arr.length - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontFamily: "monospace", fontSize: "0.75rem", color: "text.primary", fontWeight: 500 }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Forensic Summary */}
          <Box
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: { xs: 3, md: 5 },
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 256,
                height: 256,
                bgcolor: "rgba(138,92,246,0.05)",
                borderRadius: "50%",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontFamily: "var(--font-playfair), serif",
                color: "text.primary",
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <SubjectIcon sx={{ color: "primary.main" }} />
              Forensic Summary
            </Typography>
            <Box sx={{ borderLeft: "2px solid", borderColor: "primary.main", pl: 3 }}>
              <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: 800 }}>
                The model identified unnatural micro-textures in the hair follicles and inconsistent
                light reflection in the irises, which are hallmark signatures of GAN-based synthesis.
                Spatial frequency analysis reveals distinct checkerboard artifacts common in upsampling
                layers of diffusion models. The overall noise profile lacks the natural grain variance
                expected from a physical camera sensor, solidifying the high confidence verdict of
                synthetic generation.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}