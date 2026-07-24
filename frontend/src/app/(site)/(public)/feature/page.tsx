"use client";

import Link from "next/link";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import HistoryIcon from "@mui/icons-material/History";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ReportCard from "@/components/analysis/report-card";
import ReportTag from "@/components/analysis/report-tag";
import HeatSignature from "@/components/ui/heat-signature";

const FEATURES = [
  {
    icon: <CloudUploadIcon />,
    tag: "Core",
    title: "Single-Image Analysis",
    description:
      "Upload one face and get a verdict in seconds — no setup and no batching required.",
  },
  {
    icon: <DynamicFeedIcon />,
    tag: "Batch",
    title: "Bulk Analysis",
    description:
      "Analyze up to 10 images in one pass, with per-file results and a clear breakdown of anything that failed.",
  },
  {
    icon: <GpsFixedIcon />,
    tag: "Explain",
    title: "Grad-CAM Heatmaps",
    description:
      "Every result ships with a heatmap over the regions that drove the decision, with an opacity slider to compare it against the original.",
  },
  {
    icon: <FactCheckIcon />,
    tag: "Verdict",
    title: "Confidence Breakdown",
    description:
      "See the real/fake split, not just a label. Cases the model finds ambiguous are flagged as uncertain instead of forced either way.",
  },
  {
    icon: <HistoryIcon />,
    tag: "Log",
    title: "Detection Log",
    description:
      "Every analysis is timestamped and given an ID, so you can reference or revisit a result later.",
  },
  {
    icon: <LockOpenIcon />,
    tag: "Access",
    title: "No Account Needed",
    description:
      "Run an anonymous analysis with no sign-up, or sign in to keep a history tied to your account.",
  },
];

const FeaturesPage = () => {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        bgcolor: "background.default",
        color: "text.primary",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Stack sx={{ textAlign: "center", alignItems: "center", mb: 6 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: "'Roboto Mono', monospace",
              letterSpacing: "0.12em",
              color: "text.secondary",
              fontSize: "0.7rem",
              mb: 1,
            }}
          >
            Capabilities
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5 }}>
            Explainable Deepfake Detection
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 560 }}
          >
            Everything TruthLens gives you beyond a real/fake label — built to
            make each verdict something you can check.
          </Typography>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {FEATURES.map((feature) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={feature.title}>
              <ReportCard
                icon={feature.icon}
                title={feature.title}
                right={<ReportTag>{feature.tag}</ReportTag>}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", lineHeight: 1.6 }}
                >
                  {feature.description}
                </Typography>
              </ReportCard>
            </Grid>
          ))}
        </Grid>

        <ReportCard
          icon={<GpsFixedIcon />}
          title="Grad-CAM, up close"
          right={<ReportTag>Simulated preview</ReportTag>}
        >
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <HeatSignature size={220} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 7 }}>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", lineHeight: 1.7, mb: 1.5 }}
              >
                The heatmap isn&apos;t a decoration, it&apos;s the model&apos;s
                attention map, rendered directly over your image. Drag the
                opacity slider on any result to fade between the original photo
                and the activation regions, and judge the evidence for yourself.
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", lineHeight: 1.7 }}
              >
                Cooler tones mark areas the model largely ignored; warmer tones
                mark the regions that pushed it toward
                &ldquo;AI-manipulated.&rdquo;
              </Typography>
            </Grid>
          </Grid>
        </ReportCard>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            mt: 6,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            See it on your own images
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 3, maxWidth: 480, mx: "auto" }}
          >
            No account required to get started.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "center" }}
          >
            <Button
              component={Link}
              href="/analysis"
              variant="contained"
              size="large"
            >
              Analyze an image
            </Button>
            <Button
              component={Link}
              href="/bulk-analysis"
              variant="outlined"
              size="large"
            >
              Try bulk analysis
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default FeaturesPage;
