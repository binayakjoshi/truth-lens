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
} from "@mui/material";

import ImageUpload from "@/components/custom-elements/image-upload";
import { useForm } from "@/hooks/use-form";

const AnalysisPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.isValid) return;

    setIsSubmitting(true);
  };

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
      </Container>
    </Box>
  );
};

export default AnalysisPage;
