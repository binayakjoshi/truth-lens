"use client";

import { type ReactNode, useState } from "react";

import Image from "next/image";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import VerifiedIcon from "@mui/icons-material/Verified";
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
  Divider,
} from "@mui/material";

import ImageUpload from "@/components/custom-elements/image-upload";
import { useUser } from "@/context/user-context";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  id: string;
  classification: "real" | "fake" | "uncertain";
  userId?: string; // optional now — anonymous analyses won't have this
  realConfidence: number;
  fakeConfidence: number;
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

type StatusColor = "error.main" | "success.main" | "warning.main";

interface StatusMeta {
  label: string;
  color: StatusColor;
  isUncertain: boolean;
  confidencePercent: number;
  realPercent: number;
  fakePercent: number;
  Icon: typeof SmartToyIcon;
}

function getStatusMeta(result: AnalysisResult): StatusMeta {
  const { classification, realConfidence, fakeConfidence } = result;
  const realPercent = Math.round(realConfidence * 1000) / 10;
  const fakePercent = Math.round(fakeConfidence * 1000) / 10;

  if (classification === "fake") {
    return {
      label: "AI Generated",
      color: "error.main",
      isUncertain: false,
      confidencePercent: fakePercent,
      realPercent,
      fakePercent,
      Icon: SmartToyIcon,
    };
  }

  if (classification === "uncertain") {
    return {
      label: "Uncertain",
      color: "warning.main",
      isUncertain: true,
      confidencePercent: Math.max(realPercent, fakePercent),
      realPercent,
      fakePercent,
      Icon: HelpOutlineIcon,
    };
  }

  return {
    label: "Authentic",
    color: "success.main",
    isUncertain: false,
    confidencePercent: realPercent,
    realPercent,
    fakePercent,
    Icon: VerifiedIcon,
  };
}

const RING_SIZE = 168;
const RING_R = 66;
const RING_STROKE = 16;
const RING_CX = RING_SIZE / 2;
const RING_CY = RING_SIZE / 2;
const GAP_DEG = 6;

function polarToCartesian(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: RING_CX + RING_R * Math.cos(rad),
    y: RING_CY + RING_R * Math.sin(rad),
  };
}

function describeArc(startDeg: number, endDeg: number): string {
  if (endDeg <= startDeg) return "";
  const start = polarToCartesian(startDeg);
  const end = polarToCartesian(endDeg);
  const largeArcFlag = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RING_R} ${RING_R} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function ConfidenceRing({
  realPercent,
  confidencePercent,
  label,
}: {
  realPercent: number;
  fakePercent: number;
  confidencePercent: number;
  label: string;
}) {
  const realDeg = (realPercent / 100) * 360;
  const realStart = GAP_DEG / 2;
  const realEnd = Math.max(realStart, realDeg - GAP_DEG / 2);
  const fakeStart = Math.min(360 - GAP_DEG / 2, realDeg + GAP_DEG / 2);
  const fakeEnd = 360 - GAP_DEG / 2;

  return (
    <Box sx={{ position: "relative", width: RING_SIZE, height: RING_SIZE }}>
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      >
        <circle
          cx={RING_CX}
          cy={RING_CY}
          r={RING_R}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth={RING_STROKE}
        />
        <path
          d={describeArc(realStart, realEnd)}
          fill="none"
          stroke="var(--mui-palette-primary-main, #4338ca)"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
        />
        <path
          d={describeArc(fakeStart, fakeEnd)}
          fill="none"
          stroke="var(--mui-palette-error-main, #d32f2f)"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
        />
      </svg>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "1.8rem",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {confidencePercent}
          <Typography
            component="span"
            sx={{ fontWeight: 800, fontSize: "1rem" }}
          >
            %
          </Typography>
        </Typography>
        <Typography
          variant="caption"
          sx={{ mt: 0.5, color: "text.secondary", fontSize: "0.75rem" }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

function VerdictPill({ meta }: { meta: StatusMeta }) {
  const { label, color, Icon } = meta;
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: "center",
        bgcolor: color,
        color: "#fff",
        borderRadius: 999,
        px: 2.5,
        py: 0.9,
      }}
    >
      <Icon sx={{ fontSize: "1.1rem" }} />
      <Typography
        sx={{
          fontWeight: 700,
          letterSpacing: "0.06em",
          fontSize: "0.8rem",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

/** Shared card shell: icon + title on the left, an optional tag/value on the right */
function ReportCard({
  icon,
  title,
  right,
  children,
}: {
  icon: ReactNode;
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Stack
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 1.75,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
            {title}
          </Typography>
        </Stack>
        {right}
      </Stack>
      <Divider />
      <Box sx={{ p: 2.5, flex: 1 }}>{children}</Box>
    </Stack>
  );
}

function ImageFrame({ src, alt }: { src: string; alt: string }) {
  return (
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
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 900px) 100vw, 380px"
        style={{ objectFit: "contain" }}
      />
    </Box>
  );
}

const AnalysisPage = () => {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [uploadKey, setUploadKey] = useState(0); // bump to remount ImageUpload
  const [heatmapOpacity, setHeatmapOpacity] = useState(80);
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

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const body = await res.json();

      if (!res.ok) {
        if (res.status === 422) {
          error(body.message);
          return;
        }
        error("Could not process image. Please try again later.");
        return;
      }
      success("Image analyzed sucessfully.");
      setResult(body.data);
      setHeatmapOpacity(80); // reset slider for the new result
      inputHandler("image", undefined, false); // clear form state for the image field
      setUploadKey((prev) => prev + 1); // force ImageUpload to remount, clearing preview
    } catch (_err: any) {
      error("Could not process image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
                  right={
                    <Box
                      sx={{
                        px: 1.25,
                        py: 0.4,
                        borderRadius: 999,
                        bgcolor: "action.selected",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                      }}
                    >
                      Grad-CAM
                    </Box>
                  }
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
                    {/* Base layer: original image */}
                    <Image
                      src={`http://backend:5000/${result.originalImageUrl}`}
                      alt="Original upload"
                      fill
                      sizes="(max-width: 900px) 100vw, 380px"
                      style={{ objectFit: "contain" }}
                    />
                    {/* Overlay layer: heatmap, opacity controlled by slider */}
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
                      onChange={(_, value) =>
                        setHeatmapOpacity(value as number)
                      }
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
