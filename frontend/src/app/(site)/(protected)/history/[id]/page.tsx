import { type ReactNode } from "react";

import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import VerifiedIcon from "@mui/icons-material/Verified";
import {
  Box,
  Container,
  Divider,
  Grid,
  Slider,
  Stack,
  Typography,
  Button,
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
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 6, pb: 6 }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            mb: 4,
            pb: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box>
            <Link
              href="/history"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                color: "inherit",
                textDecoration: "none",
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
                }}
              >
                <ArrowBackIcon sx={{ fontSize: "0.9rem" }} />
                Back to history
              </Typography>
            </Link>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}
            >
              Forensic Report: #{item.id.slice(0, 8)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: 999, textTransform: "none" }}
          >
            Export PDF
          </Button>
        </Stack>

        {/* Three cards: Input / Reasoning / Verdict */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <ReportCard icon={<ImageOutlinedIcon />} title="Input">
              <ImageFrame
                src={`${process.env.BACKEND_API_URL}/${item.originalImageUrl}`}
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
              <ImageFrame
                src={`${process.env.BACKEND_API_URL}/${item.heatmapImageUrl}`}
                alt="Heatmap overlay"
              />
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Heatmap Opacity
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    80%
                  </Typography>
                </Stack>
                <Slider defaultValue={80} size="small" />
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
                  realPercent={realPercent}
                  fakePercent={fakePercent}
                  confidencePercent={confidencePercent}
                  label="Confidence"
                />
                <VerdictPill meta={meta} />
              </Stack>
            </ReportCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
