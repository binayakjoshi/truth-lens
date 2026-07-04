"use client";

import { useState } from "react";

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
  Card,
  CardContent,
  CardMedia,
  Alert,
} from "@mui/material";

import ImageUpload from "@/components/custom-elements/image-upload";
import { useForm } from "@/hooks/use-form";

const AnalysisPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
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
      formData.append("file", formState.inputs.image.value);

      const res = await fetch("/api/analysis", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFake = result?.prediction === "AI-Generated";

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Stack sx={{ textAlign: "center", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Detect Deepfakes Instantly
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Upload a face image and TruthLens will analyze it for signs of
            manipulation, with a visual explanation of what it found.
          </Typography>
        </Stack>
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

        {result && (
          <Card
            elevation={0}
            sx={{
              mt: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            {result.heatmap_base64 && (
              <CardMedia
                component="img"
                image={result.heatmap_base64}
                alt="Grad-CAM heatmap"
                sx={{ maxHeight: 300, objectFit: "contain", bgcolor: "#000" }}
              />
            )}
            <CardContent>
              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Prediction
                  </Typography>
                  <Chip
                    label={result.prediction}
                    color={isFake ? "error" : "success"}
                    variant="filled"
                  />
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Real confidence
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {(result.confidence_scores.real * 100).toFixed(1)}%
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    AI confidence
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {(result.confidence_scores.ai_generated * 100).toFixed(1)}%
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default AnalysisPage;
