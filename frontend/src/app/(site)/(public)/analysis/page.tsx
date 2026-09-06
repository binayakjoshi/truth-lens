"use client";

import { useState } from "react";

import Image from "next/image";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Grid,
  Slider,
} from "@mui/material";

import ConfidenceRing from "@/components/analysis/confidence-ring";
import ImageFrame from "@/components/analysis/image-frame";
import ReportCard from "@/components/analysis/report-card";
import ReportTag from "@/components/analysis/report-tag";
import VerdictPill from "@/components/analysis/verdict-pill";
import ImageUpload from "@/components/custom-elements/image-upload";
import { useUser } from "@/context/user-context";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";
import { getStatusMeta, formatDate } from "@/lib/analysis-report";
import { type AnalysisResult } from "@/types/type";

const AnalysisPage = () => {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [uploadKey, setUploadKey] = useState(0);
  const [heatmapOpacity, setHeatmapOpacity] = useState(80);
  const [formState, inputHandler] = useForm(
    { image: { isValid: false, touched: false, value: "" } },
    false,
  );
  const { success, error } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.isValid) return;

    setIsSubmitting(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", formState.inputs.image.value as Blob);

      const endpoint = user ? "/api/analysis" : "/api/analysis/anonymous";
      const res = await fetch(endpoint, { method: "POST", body: formData });
      const body = await res.json();

      if (!res.ok) {
        if (res.status === 429 || res.status === 422) {
          error(body.message);
          return;
        }
        error("Could not process image. Please try again later.");
        return;
      }
      success("Image analyzed sucessfully.");
      setResult(body.data);
      setHeatmapOpacity(80);
      inputHandler("image", undefined, false);
      setUploadKey((prev) => prev + 1);
    } catch (_err: any) {
      error("Could not process image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (event: React.FormEvent) => {
    void handleSubmit(event);
  };
  const meta = result ? getStatusMeta(result) : null;

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        bgcolor: "background.default",
        color: "text.primary",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 6,
      }}
    >
      <Container maxWidth={result ? "lg" : "sm"}>
        <Stack sx={{ textAlign: "center", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Detect Deepfakes Instantly
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Upload a face image and TruthLens will analyze it for signs of
            manipulation, with a visual explanation of what it found.
          </Typography>
        </Stack>

        <Container maxWidth="sm" disableGutters>
          <Paper
            component="form"
            onSubmit={onSubmit}
            noValidate
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <ImageUpload key={uploadKey} onInput={inputHandler} id="image" />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={!formState.inputs.image.isValid || isSubmitting}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <CloudUploadIcon />
                )
              }
              sx={{ mt: 3 }}
            >
              {isSubmitting ? "Analyzing..." : "Analyze Image"}
            </Button>
          </Paper>
        </Container>

        {result && meta && (
          <Box sx={{ mt: 6 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "flex-end" },
                mb: 4,
                pb: 3,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    display: "block",
                    letterSpacing: "0.12em",
                    color: "text.secondary",
                    fontSize: "0.7rem",
                    mb: 0.5,
                  }}
                >
                  Detection log · #{result.id.slice(0, 8)}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  Analysis Result
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontSize: "0.8rem" }}
              >
                {formatDate(result.createdAt)}
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <ReportCard icon={<ImageOutlinedIcon />} title="Input">
                  <ImageFrame
                    src={`http://backend:5000/${result.originalImageUrl}`}
                    alt="Original upload"
                  />
                </ReportCard>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <ReportCard
                  icon={<GpsFixedIcon />}
                  title="Reasoning"
                  right={<ReportTag>Grad-CAM</ReportTag>}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: 2,
                      overflow: "hidden",
                      bgcolor: "action.hover",
                    }}
                  >
                    <Image
                      src={`http://backend:5000/${result.originalImageUrl}`}
                      alt="Original upload"
                      fill
                      sizes="(max-width: 900px) 100vw, 380px"
                      style={{ objectFit: "contain" }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        opacity: heatmapOpacity / 100,
                        transition: "opacity 120ms linear",
                        pointerEvents: "none",
                      }}
                    >
                      <Image
                        src={`${process.env.NEXT_PUBLIC_IMAGE_API_URL}/${result.heatmapImageUrl}`}
                        alt="Heatmap overlay"
                        fill
                        sizes="(max-width: 900px) 100vw, 380px"
                        style={{ objectFit: "contain" }}
                      />
                    </Box>
                  </Box>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Stack
                      direction="row"
                      sx={{ justifyContent: "space-between" }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        Heatmap Opacity
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {heatmapOpacity}%
                      </Typography>
                    </Stack>
                    <Slider
                      value={heatmapOpacity}
                      onChange={(_, value) => setHeatmapOpacity(value)}
                      size="small"
                      min={0}
                      max={100}
                    />
                  </Stack>
                </ReportCard>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <ReportCard icon={<FactCheckIcon />} title="Verdict">
                  <Stack
                    spacing={2}
                    sx={{
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ConfidenceRing
                      realPercent={meta.realPercent}
                      fakePercent={meta.fakePercent}
                      confidencePercent={meta.confidencePercent}
                      label="Confidence"
                    />
                    <VerdictPill meta={meta} />
                  </Stack>
                </ReportCard>
              </Grid>
            </Grid>

            <Stack spacing={1} sx={{ mt: 5 }}>
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: "0.1em",
                  color: "text.secondary",
                  fontSize: "0.7rem",
                }}
              >
                Metadata
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Analysis ID: {result.id}
              </Typography>
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AnalysisPage;
