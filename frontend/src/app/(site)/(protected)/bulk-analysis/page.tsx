"use client";

import { useState } from "react";

import Image from "next/image";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import MultiImageUpload from "@/components/custom-elements/multi-image-upload";

interface BulkResult {
  id: string;
  classification: "real" | "fake";
  userId?: string;
  confidence: number;
  originalImageUrl: string;
  heatmapImageUrl: string;
  createdAt: string;
}

interface BulkFailure {
  filename?: string;
  message?: string;
  [key: string]: unknown;
}

interface BulkData {
  total: number;
  succeeded: number;
  failed: number;
  results: BulkResult[];
  failures: BulkFailure[];
}

const MAX_FILES = 15;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const BulkAnalysisPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isFilesValid, setIsFilesValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<BulkData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputHandler = (_id: string, newFiles: File[], isValid: boolean) => {
    setFiles(newFiles);
    setIsFilesValid(isValid);
    setData(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFilesValid || files.length === 0) return;

    setIsSubmitting(true);
    setData(null);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/analysis/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const body = await res.json();

      if (!res.ok || !body.success) {
        throw new Error(body.message ?? "Bulk analysis failed");
      }

      setData(body.data as BulkData);
      setFiles([]);
      setIsFilesValid(false);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <Container maxWidth={data ? "lg" : "sm"}>
        <Stack sx={{ textAlign: "center", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Bulk Deepfake Detection
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Upload up to {MAX_FILES} face images and TruthLens will analyze all
            of them in a single batch.
          </Typography>
        </Stack>

        <Container maxWidth="sm" disableGutters>
          <Paper
            component="form"
            onSubmit={handleSubmit}
            noValidate
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <MultiImageUpload
              id="files"
              maxFiles={MAX_FILES}
              onInput={inputHandler}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={!isFilesValid || isSubmitting}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <CloudUploadIcon />
                )
              }
              sx={{ mt: 3 }}
            >
              {isSubmitting
                ? "Analyzing..."
                : `Analyze ${files.length || ""} Image${
                    files.length === 1 ? "" : "s"
                  }`}
            </Button>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
        </Container>

        {data && (
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
              <Typography
                variant="overline"
                sx={{
                  fontFamily: "'Roboto Mono', monospace",
                  letterSpacing: "0.12em",
                  color: "text.secondary",
                  fontSize: "0.7rem",
                  mb: 0.5,
                }}
              >
                Batch detection log
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}
              >
                Bulk Analysis Results
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Chip
                  label={`Total: ${data.total}`}
                  variant="outlined"
                  sx={{ fontFamily: "'Roboto Mono', monospace" }}
                />
                <Chip
                  label={`Succeeded: ${data.succeeded}`}
                  sx={{
                    bgcolor: "success.main",
                    color: "#fff",
                    fontWeight: 600,
                    fontFamily: "'Roboto Mono', monospace",
                  }}
                />
                {data.failed > 0 && (
                  <Chip
                    label={`Failed: ${data.failed}`}
                    sx={{
                      bgcolor: "error.main",
                      color: "#fff",
                      fontWeight: 600,
                      fontFamily: "'Roboto Mono', monospace",
                    }}
                  />
                )}
              </Stack>
            </Stack>

            {data.failures.length > 0 && (
              <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
                {data.failures.length} file
                {data.failures.length === 1 ? "" : "s"} failed to process.
              </Alert>
            )}

            <Grid container spacing={3}>
              {data.results.map((result) => {
                const isReal = result.classification === "real";
                const confidencePercent =
                  Math.round(result.confidence * 1000) / 10;

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={result.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        height: "100%",
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Chip
                          label={isReal ? "Real" : "Fake"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontFamily: "'Roboto Mono', monospace",
                            letterSpacing: "0.05em",
                            bgcolor: isReal ? "success.main" : "error.main",
                            color: "#fff",
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "'Roboto Mono', monospace",
                            color: "text.secondary",
                          }}
                        >
                          {confidencePercent}%
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1.5}>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mb: 0.5 }}
                          >
                            Original
                          </Typography>
                          <Box
                            sx={{
                              position: "relative",
                              width: "100%",
                              aspectRatio: "1 / 1",
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 1.5,
                              overflow: "hidden",
                              bgcolor: "background.paper",
                            }}
                          >
                            <Image
                              src={`http://backend:5000/${result.originalImageUrl}`}
                              alt="Original upload"
                              fill
                              sizes="180px"
                              style={{ objectFit: "contain" }}
                            />
                          </Box>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mb: 0.5 }}
                          >
                            Heat Map
                          </Typography>
                          <Box
                            sx={{
                              position: "relative",
                              width: "100%",
                              aspectRatio: "1 / 1",
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 1.5,
                              overflow: "hidden",
                              bgcolor: "background.paper",
                            }}
                          >
                            <Image
                              src={`${process.env.NEXT_PUBLIC_IMAGE_API_URL}/${result.heatmapImageUrl}`}
                              alt="Heatmap Overlay"
                              fill
                              sizes="180px"
                              style={{ objectFit: "contain" }}
                            />
                          </Box>
                        </Box>
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          fontFamily: "'Roboto Mono', monospace",
                          color: "text.secondary",
                        }}
                      >
                        ID: {result.id.slice(0, 8)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          fontFamily: "'Roboto Mono', monospace",
                          color: "text.secondary",
                        }}
                      >
                        {formatDate(result.createdAt)}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default BulkAnalysisPage;
