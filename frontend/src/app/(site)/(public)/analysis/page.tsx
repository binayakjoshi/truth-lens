"use client";

import { useState } from "react";

import Image from "next/image";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Chip,
  Grid,
  Divider,
  Alert,
} from "@mui/material";

import ImageUpload from "@/components/custom-elements/image-upload";
import { useForm } from "@/hooks/use-form";

interface AnalysisResult {
  id: string;
  classification: "real" | "fake";
  userId: string;
  confidence: number;
  originalImageUrl: string;
  heatmapImageUrl: string;
  createdAt: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AnalysisPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formState, inputHandler] = useForm(
    {
      image: {
        isValid: false,
        touched: false,
        value: "",
      },
    },
    false,
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.isValid) return;

    setIsSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", formState.inputs.image.value as Blob);

      const res = await fetch("/api/analysis", {
        method: "POST",
        body: formData,
      });

      const body = await res.json();

      if (!res.ok || !body.success) {
        throw new Error(body.message ?? "Analysis failed");
      }

      setResult(body.data);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReal = result?.classification === "real";
  const confidencePercent = result
    ? Math.round(result.confidence * 1000) / 10
    : 0;

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
            onSubmit={(e) => {
              handleSubmit(e);
            }}
            noValidate
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <ImageUpload onInput={inputHandler} id="image" />

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

          {error && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
        </Container>

        {result && (
          <Box sx={{ mt: 6 }}>
            <Stack
              spacing={0.5}
              sx={{
                mb: 4,
                pb: 3,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "flex-end" },
                }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      display: "block",
                      fontFamily: "'Roboto Mono', monospace",
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
                  sx={{
                    fontFamily: "'Roboto Mono', monospace",
                    color: "text.secondary",
                    fontSize: "0.8rem",
                  }}
                >
                  {formatDate(result.createdAt)}
                </Typography>
              </Stack>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ alignItems: "center", mb: 5 }}
            >
              <Chip
                label={isReal ? "Real" : "Fake"}
                sx={{
                  fontWeight: 700,
                  fontFamily: "'Roboto Mono', monospace",
                  letterSpacing: "0.05em",
                  bgcolor: isReal ? "success.main" : "error.main",
                  color: "#fff",
                  px: 1,
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Roboto Mono', monospace",
                  color: "text.secondary",
                }}
              >
                Confidence: <strong>{confidencePercent}%</strong>
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="overline"
                  sx={{
                    display: "block",
                    fontFamily: "'Roboto Mono', monospace",
                    letterSpacing: "0.1em",
                    color: "text.secondary",
                    fontSize: "0.7rem",
                    mb: 1,
                  }}
                >
                  Original Image
                </Typography>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: { xs: 280, sm: 320, md: 340 },
                    aspectRatio: "1 / 1",
                    mx: { xs: "auto", md: 0 },
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: "background.paper",
                  }}
                >
                  <Image
                    src={`http://backend:5000/${result.originalImageUrl}`}
                    alt="Original upload"
                    fill
                    sizes="(max-width: 900px) 280px, 340px"
                    style={{ objectFit: "contain" }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="overline"
                  sx={{
                    display: "block",
                    fontFamily: "'Roboto Mono', monospace",
                    letterSpacing: "0.1em",
                    color: "text.secondary",
                    fontSize: "0.7rem",
                    mb: 1,
                  }}
                >
                  Heat Map Overlay
                </Typography>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: { xs: 280, sm: 320, md: 340 },
                    aspectRatio: "1 / 1",
                    mx: { xs: "auto", md: 0 },
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: "background.paper",
                  }}
                >
                  <Image
                    src={`http://backend:5000/${result.heatmapImageUrl}`}
                    alt="Heatmap Overlay"
                    fill
                    sizes="(max-width: 900px) 280px, 340px"
                    style={{ objectFit: "contain" }}
                  />
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 5 }} />

            <Stack spacing={1}>
              <Typography
                variant="overline"
                sx={{
                  fontFamily: "'Roboto Mono', monospace",
                  letterSpacing: "0.1em",
                  color: "text.secondary",
                  fontSize: "0.7rem",
                }}
              >
                Metadata
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: "0.8rem",
                  color: "text.secondary",
                }}
              >
                <Typography variant="body2" sx={{ fontFamily: "inherit" }}>
                  Analysis ID: {result.id}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AnalysisPage;
