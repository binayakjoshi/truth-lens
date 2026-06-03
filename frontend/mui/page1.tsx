"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import IconButton from "@mui/material/IconButton";
import BlurOnIcon from "@mui/icons-material/BlurOn";
import PlagiarismOutlinedIcon from "@mui/icons-material/PlagiarismOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Chip from "@mui/material/Chip";

export default function LandingPage() {
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", overflowX: "hidden" }}>
      {/* TopAppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "rgba(12,12,14,0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1280,
            width: "100%",
            mx: "auto",
            px: { xs: 2, md: 6 },
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Typography
            variant="h6"
            sx={{
              fontFamily: "var(--font-playfair), serif",
              fontWeight: 700,
              color: "primary.light",
              fontSize: "1.2rem",
            }}
          >
            TruthLens
          </Typography>

          {/* Nav links */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3, alignItems: "center" }}>
            {["Features", "How It Works", "Use Cases"].map((item) => (
              <Typography
                key={item}
                component="a"
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                sx={{
                  color: "text.secondary",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-roboto), sans-serif",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  transition: "color 0.2s",
                  "&:hover": { color: "primary.light" },
                }}
              >
                {item}
              </Typography>
            ))}
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton size="small" sx={{ color: "primary.light" }}>
              <NotificationsOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: "primary.light" }}>
              <AccountCircleOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ pt: "64px" }}>
        {/* Hero Section */}
        <Box
          sx={{
            maxWidth: 1280,
            mx: "auto",
            px: { xs: 2, md: 6 },
            py: 8,
            minHeight: 820,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 6,
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* Left: Text */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography
                variant="h1"
                sx={{
                  fontFamily: "var(--font-playfair), serif",
                  fontWeight: 700,
                  fontSize: { xs: "2.5rem", md: "3rem" },
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: "text.primary",
                }}
              >
                Detect AI-Generated Images With{" "}
                <Box component="span" sx={{ color: "primary.light" }}>
                  Confidence
                </Box>
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontSize: "1.125rem",
                  lineHeight: 1.6,
                  maxWidth: 520,
                }}
              >
                Upload an image and receive instant authenticity analysis, confidence scores, and
                explainable AI visualizations designed for professionals.
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, pt: 1 }}>
                <Button
                  component={Link}
                  href="/analysis/new"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Analyze Image
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: "divider",
                    color: "text.primary",
                    "&:hover": { borderColor: "primary.main", bgcolor: "rgba(138,92,246,0.05)" },
                  }}
                >
                  View Demo
                </Button>
              </Box>
            </Box>

            {/* Right: Image */}
            <Box
              sx={{
                position: "relative",
                width: "100%",
                aspectRatio: "1",
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
              }}
            >
              <Box
                component="img"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOlmyXB-jeHL-dUeQ_Wme8Adr5kAyt78ZjxQZGONohM_IPNPyd8HgWA__FgA83kTpQs0BovDYZEeGuxzjW8rnH8GLr09TZ1VaAop0WZzss_9Xe9rssSkeYUzJ0-VapnQm-QiS2jCHfKogvPA0LBaUeH0B4h-1Imo4z2HL8sRdLyyieu3tcCfkLfrJSeXuHxvOSyLBhFXjT9mkLobWUZHe0M8jYCux8UQRV_AiN-6ku7qOi6Kjge9ruUQIdl2_bYYWmmpTKbgAfOLc"
                alt="AI Analysis Abstract Visual"
                sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 2, opacity: 0.9 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Features Section */}
        <Box
          id="features"
          sx={{
            bgcolor: "background.paper",
            borderTop: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
            py: 8,
          }}
        >
          <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 6 } }}>
            <Box sx={{ mb: 5, maxWidth: 560 }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: "var(--font-playfair), serif",
                  fontWeight: 700,
                  fontSize: "2rem",
                  color: "text.primary",
                  mb: 1.5,
                }}
              >
                Computational Clarity
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                Advanced forensic tools distilled into a high-density, low-friction interface.
              </Typography>
            </Box>

            {/* Bento Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 3,
              }}
            >
              {/* Feature 1 */}
              <FeatureCard
                icon={<BlurOnIcon />}
                title="Heatmap Visualization"
                description="Identify pixel-level anomalies and generative artifacts with high-contrast, verifiable overlay maps."
              />

              {/* Feature 2 - spans 2 cols */}
              <Box
                sx={{
                  gridColumn: { md: "span 2" },
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: "rgba(138,92,246,0.4)" },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "rgba(138,92,246,0.1)",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "primary.main",
                    }}
                  >
                    <PlagiarismOutlinedIcon />
                  </Box>
                  <Chip
                    label="v2.4 Engine Active"
                    size="small"
                    sx={{
                      bgcolor: "rgba(138,92,246,0.12)",
                      color: "primary.light",
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      borderRadius: "999px",
                    }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontFamily: "var(--font-playfair), serif", color: "text.primary" }}>
                  Deep Metadata Analysis
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Extract and verify structural signatures, camera origin tags, and manipulation traces hidden within file headers.
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: "auto", pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                  {["EXIF", "IPTC", "XMP"].map((tag, i) => (
                    <Box key={tag} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {i > 0 && <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "text.disabled" }} />}
                      <Typography sx={{ fontFamily: "monospace", fontSize: "0.75rem", color: "text.secondary" }}>
                        {tag}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Feature 3 - spans 3 cols */}
              <Box sx={{ gridColumn: { md: "span 3" } }}>
                <FeatureCard
                  icon={<DescriptionOutlinedIcon />}
                  title="Professional Reports"
                  description="Generate immutable, timestamped PDF reports suitable for legal, compliance, and journalistic review. Includes full audit trails and explainable AI summaries."
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          py: 6,
        }}
      >
        <Box
          sx={{
            maxWidth: 1280,
            mx: "auto",
            px: { xs: 2, md: 6 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 3,
          }}
        >
          <Box sx={{ gridColumn: { xs: "span 2", md: "span 1" } }}>
            <Typography
              variant="h6"
              sx={{ fontFamily: "var(--font-playfair), serif", color: "primary.light", fontWeight: 700, mb: 1 }}
            >
              TruthLens
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              © 2024 TruthLens AI Forensics. All rights reserved.
            </Typography>
          </Box>
          {[
            { title: "Product", links: ["Product"] },
            { title: "Resources", links: ["Resources", "Company"] },
            { title: "Legal", links: ["Privacy", "Terms"] },
          ].map((col) => (
            <Box key={col.title} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography
                variant="caption"
                sx={{ color: "text.primary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}
              >
                {col.title}
              </Typography>
              {col.links.map((link) => (
                <Typography
                  key={link}
                  component="a"
                  href="#"
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    textDecoration: "none",
                    "&:hover": { color: "primary.light" },
                    transition: "color 0.2s",
                  }}
                >
                  {link}
                </Typography>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// Reusable feature card
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "100%",
        transition: "border-color 0.2s",
        "&:hover": { borderColor: "rgba(138,92,246,0.4)" },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          bgcolor: "rgba(138,92,246,0.1)",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "primary.main",
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontFamily: "var(--font-playfair), serif", color: "text.primary" }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mt: "auto" }}>
        {description}
      </Typography>
    </Box>
  );
}