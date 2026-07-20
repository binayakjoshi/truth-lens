import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Chip,
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

function getStatusMeta(item: AnalysisHistory) {
  const { classification, realConfidence, fakeConfidence } = item;
  const realPercent = Math.round(realConfidence * 1000) / 10;
  const fakePercent = Math.round(fakeConfidence * 1000) / 10;

  if (classification === "fake") {
    return {
      label: "Fake",
      color: "error.main" as const,
      isUncertain: false,
      confidencePercent: fakePercent,
      realPercent,
      fakePercent,
    };
  }

  if (classification === "uncertain") {
    return {
      label: "Uncertain",
      color: "warning.main" as const,
      isUncertain: true,
      confidencePercent: Math.max(realPercent, fakePercent),
      realPercent,
      fakePercent,
    };
  }

  return {
    label: "Real",
    color: "success.main" as const,
    isUncertain: false,
    confidencePercent: realPercent,
    realPercent,
    fakePercent,
  };
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

  const {
    label,
    color,
    isUncertain,
    confidencePercent,
    realPercent,
    fakePercent,
  } = getStatusMeta(item);

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

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: "center", mb: 5 }}
        >
          <Chip
            label={label}
            sx={{
              fontWeight: 700,
              fontFamily: "'Roboto Mono', monospace",
              letterSpacing: "0.05em",
              bgcolor: color,
              color: "#fff",
              px: 1,
            }}
          />
          {isUncertain ? (
            <Stack direction="row" spacing={2}>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Roboto Mono', monospace",
                  color: "success.main",
                }}
              >
                Real: <strong>{realPercent}%</strong>
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Roboto Mono', monospace",
                  color: "error.main",
                }}
              >
                Fake: <strong>{fakePercent}%</strong>
              </Typography>
            </Stack>
          ) : (
            <Typography
              variant="body1"
              sx={{
                fontFamily: "'Roboto Mono', monospace",
                color: "text.secondary",
              }}
            >
              Confidence: <strong>{confidencePercent}%</strong>
            </Typography>
          )}
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
                src={`${process.env.BACKEND_API_URL}/${item.originalImageUrl}`}
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
                src={`${process.env.BACKEND_API_URL}/${item.heatmapImageUrl}`}
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
              Analysis ID: {item.id}
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
