"use client";

import type { ReactNode } from "react";

import Link from "next/link";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CropFreeIcon from "@mui/icons-material/CropFree";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LayersIcon from "@mui/icons-material/Layers";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ReportCard from "@/components/analysis/report-card";
import ReportTag from "@/components/analysis/report-tag";
import HeatSignature from "@/components/ui/heat-signature";

interface PipelineStep {
  index: string;
  icon: ReactNode;
  title: string;
  description: string;
  techniques?: string[];
}

const STEPS: PipelineStep[] = [
  {
    index: "01",
    icon: <CloudUploadIcon />,
    title: "Upload a face image",
    description:
      "Drop in a JPG or PNG. Analyze one image directly, or send up to 10 at once through Bulk Analysis.",
  },
  {
    index: "02",
    icon: <CropFreeIcon />,
    title: "Locate & enhance",
    description:
      "The face region is isolated, then run through CLAHE, unsharp masking, and a high-pass filter — the same enhancement stack that surfaces the fine-grained blending artifacts most deepfakes leave behind.",
    techniques: ["CLAHE", "Unsharp Mask", "High-Pass Filter"],
  },
  {
    index: "03",
    icon: <GpsFixedIcon />,
    title: "Classify & trace with Grad-CAM",
    description:
      "A convolutional network scores the image as real or fake. Grad-CAM records exactly which pixels drove that decision, not just the final number.",
  },
  {
    index: "04",
    icon: <FactCheckIcon />,
    title: "Read the verdict",
    description:
      "You get a real/fake confidence split plus a heatmap you can fade in and out over the original image to see the evidence yourself.",
  },
];

const HowItWorksPage = () => {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        bgcolor: "background.default",
        color: "text.primary",
        py: 6,
      }}
    >
      <Container maxWidth="md">
        <Stack sx={{ textAlign: "center", alignItems: "center", mb: 7 }}>
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
            The pipeline
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5 }}>
            How TruthLens Works
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 560 }}
          >
            Four steps from a single photo to a verdict you can actually inspect
            — no black box, just the model showing its work.
          </Typography>
        </Stack>

        <Stack spacing={0} sx={{ position: "relative" }}>
          {STEPS.map((step, i) => (
            <Box key={step.index} sx={{ display: "flex", gap: 3 }}>
              <Stack sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                >
                  {step.icon}
                </Box>
                {i < STEPS.length - 1 && (
                  <Box
                    sx={{
                      width: "1px",
                      flexGrow: 1,
                      minHeight: 40,
                      bgcolor: "divider",
                      my: 0.5,
                    }}
                  />
                )}
              </Stack>

              <Box sx={{ pb: i < STEPS.length - 1 ? 4 : 0, flex: 1 }}>
                <Typography
                  variant="overline"
                  sx={{
                    fontFamily: "'Roboto Mono', monospace",
                    letterSpacing: "0.1em",
                    color: "text.secondary",
                    fontSize: "0.7rem",
                  }}
                >
                  Step {step.index}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 0.5, mt: 0.25 }}
                >
                  {step.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {step.description}
                </Typography>
                {step.techniques && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: "wrap", gap: 1, mt: 1.5 }}
                  >
                    {step.techniques.map((technique) => (
                      <Chip
                        key={technique}
                        label={technique}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontFamily: "'Roboto Mono', monospace",
                          fontSize: "0.7rem",
                          borderColor: "divider",
                          color: "text.secondary",
                        }}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </Box>
          ))}
        </Stack>

        <Box sx={{ mt: 7 }}>
          <ReportCard
            icon={<LayersIcon />}
            title="Why Grad-CAM"
            right={<ReportTag>Simulated preview</ReportTag>}
          >
            <Grid container spacing={3} sx={{ alignItems: "center" }}>
              <Grid size={{ xs: 12, sm: 5 }}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <HeatSignature size={200} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 7 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", lineHeight: 1.7 }}
                >
                  Most detectors give you a single number and ask you to trust
                  it. TruthLens shows the reasoning instead: Grad-CAM highlights
                  the exact regions — eyes, mouth, blending edges — that pushed
                  the model toward its decision, so a verdict is something you
                  can check, not just accept.
                </Typography>
              </Grid>
            </Grid>
          </ReportCard>
        </Box>

        <Divider sx={{ my: 6 }} />

        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Ready to try it?
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 3, maxWidth: 480, mx: "auto" }}
          >
            Run a single image through the full pipeline, or send a whole batch
            at once.
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

export default HowItWorksPage;
