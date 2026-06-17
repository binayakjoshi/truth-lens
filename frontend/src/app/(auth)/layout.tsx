import React from "react";

import Image from "next/image";

import { Box, Typography } from "@mui/material";

import ThemeToggle from "@/components/ui/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse-glow {
          0% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
          100% { opacity: 0.5; transform: scale(1); }
        }
      `}</style>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        {/* ── Left panel ── */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            p: 6,
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, rgba(42,31,61,1) 0%, rgba(12,12,14,1) 100%)",
            borderRight: "1px solid",
            borderColor: "divider",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              pointerEvents: "none",
            },
          }}
        >
          {/* Brand */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: "primary.main",
              }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}
            >
              TruthLens
            </Typography>
          </Box>

          {/* Illustration */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 520,
                position: "relative",
                borderRadius: 4,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 20px 60px rgba(138,92,246,0.15)",
                animation: "float 6s ease-in-out infinite",
              }}
            >
              <Image
                src="/images/img.png"
                alt="Deepfake detection dashboard with Grad-CAM explainability"
                width={1365}
                height={1024}
                priority
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </Box>
          </Box>

          {/* Tagline */}
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, lineHeight: 1.15, mb: 1.5 }}
            >
              See through
              <br />
              the artificial.
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 300 }}
            >
              Deepfake face detection with Grad-CAM explainability.
            </Typography>
          </Box>

          {/* Ambient orb */}
          <Box
            sx={{
              position: "absolute",
              top: "15%",
              right: "-15%",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(138,92,246,0.12) 0%, transparent 70%)",
              filter: "blur(60px)",
              pointerEvents: "none",
              animation: "pulse-glow 8s ease-in-out infinite",
            }}
          />
        </Box>

        {/* ── Right panel — form slot ── */}
        <Box
          sx={{
            width: { xs: "100%", md: 480 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: { xs: 4, sm: 6 },
            py: 8,
            bgcolor: "background.paper",
            overflowY: "auto",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 24,
              right: 24,
            }}
          >
            <ThemeToggle />
          </Box>
          {/* Mobile brand */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              gap: 1.5,
              mb: 5,
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                bgcolor: "primary.main",
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              TruthLens
            </Typography>
          </Box>

          {children}
        </Box>
      </Box>
    </>
  );
}
