import { type ReactNode } from "react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import VerifiedIcon from "@mui/icons-material/Verified";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import {
  Box,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import { type AnalysisHistory } from "@/types/type";

async function getAnalysisHistoryDetail(
  id: string,
): Promise<AnalysisHistory | null> {
  const cookieStore = await cookies();
  try {
    const res = await fetch(`${process.env.PROXY_API_URL}/api/analysis/${id}`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: "no-store",
    });
    if (res.ok) {
      const resData = await res.json();
      return resData.data;
    }
    if (res.status === 404) {
      return null;
    }
  } catch {
    return null;
  }
  return null;
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

function getStatusMeta(item: AnalysisHistory): StatusMeta {
  const { classification, realConfidence, fakeConfidence } = item;
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
const GAP_DEG = 6; // degrees of empty space at each seam

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
        {/* base track, covers rounding gaps */}
        <circle
          cx={RING_CX}
          cy={RING_CY}
          r={RING_R}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth={RING_STROKE}
        />
        {/* real (green) segment */}
        <path
          d={describeArc(realStart, realEnd)}
          fill="none"
          stroke="var(--mui-palette-success-main, #2e7d32)"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
        />
        {/* fake (red) segment */}
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
            fontSize: "1.6rem",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {confidencePercent}
          <Typography
            component="span"
            sx={{ fontWeight: 800, fontSize: "0.95rem" }}
          >
            %
          </Typography>
        </Typography>
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "0.62rem",
          }}
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
          fontFamily: "'Roboto Mono', monospace",
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

function Panel({
  eyebrow,
  caption,
  children,
}: {
  eyebrow: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <Stack spacing={1} sx={{ height: "100%" }}>
      <Typography
        variant="overline"
        sx={{
          fontFamily: "'Roboto Mono', monospace",
          letterSpacing: "0.1em",
          color: "text.secondary",
          fontSize: "0.7rem",
        }}
      >
        {eyebrow}
      </Typography>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </Box>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", fontSize: "0.72rem" }}
      >
        {caption}
      </Typography>
    </Stack>
  );
}

function ImageFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 900px) 100vw, 380px"
      style={{ objectFit: "contain" }}
    />
  );
}

interface HistoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function HistoryDetailPage({
  params,
}: HistoryDetailPageProps) {
  const { id } = await params;
  const item = await getAnalysisHistoryDetail(id);

  if (!item) {
    notFound();
  }

  const meta = getStatusMeta(item);
  const { realPercent, fakePercent, confidencePercent } = meta;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 8, pb: 6, flex: 1 }}>
        {/* Header */}
        <Stack
          spacing={0.5}
          sx={{
            mb: 4,
            pb: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Link
            href="/history"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              color: "inherit",
              textDecoration: "none",
              width: "fit-content",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.secondary",
                fontSize: "0.8rem",
                mb: 1,
                "&:hover": { color: "text.primary" },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: "0.9rem" }} />
              Back to history
            </Typography>
          </Link>

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
                Detection log · #{item.id.slice(0, 8)}
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
              {formatDate(item.createdAt)}
            </Typography>
          </Stack>
        </Stack>

        {/* Verdict + images: one consistent row of matching panels */}
        <Grid container spacing={3} sx={{ mb: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Panel
              eyebrow="Original Image"
              caption="The image as uploaded, unmodified."
            >
              <ImageFrame
                src={`${process.env.BACKEND_API_URL}/${item.originalImageUrl}`}
                alt="Original upload"
              />
            </Panel>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Panel
              eyebrow="Heat Map Overlay"
              caption="Regions the model weighed most heavily."
            >
              <ImageFrame
                src={`${process.env.BACKEND_API_URL}/${item.heatmapImageUrl}`}
                alt="Heatmap overlay"
              />
            </Panel>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Panel
              eyebrow="Verdict"
              caption={`Real ${realPercent}% · Fake ${fakePercent}%`}
            >
              <Stack spacing={1.5} sx={{ alignItems: "center" }}>
                <ConfidenceRing
                  realPercent={realPercent}
                  fakePercent={fakePercent}
                  confidencePercent={confidencePercent}
                  label="Confidence"
                />
                <VerdictPill meta={meta} />
              </Stack>
            </Panel>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 5, mb: 5 }} />

        {/* Metadata */}
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
              Analysis ID: {item.id}
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
