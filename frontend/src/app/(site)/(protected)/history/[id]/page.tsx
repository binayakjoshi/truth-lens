import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { Box, Container, Grid, Stack, Typography, Button } from "@mui/material";

import ConfidenceRing from "@/components/analysis/confidence-ring";
import ImageFrame from "@/components/analysis/image-frame";
import ReportCard from "@/components/analysis/report-card";
import ReportTag from "@/components/analysis/report-tag";
import VerdictPill from "@/components/analysis/verdict-pill";
import HeatmapOverlayCard from "@/components/history/heat-map-verlay-card";
import { getStatusMeta } from "@/lib/analysis-report";
import { type AnalysisHistory } from "@/types/type";

async function getAnalysisHistoryDetail(
  id: string,
): Promise<AnalysisHistory | null> {
  const cookieStore = await cookies();
  try {
    const res = await fetch(`${process.env.PROXY_API_URL}/api/analysis/${id}`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (res.ok) {
      const resData = await res.json();
      return resData.data;
    }
    if (res.status === 404) return null;
  } catch {
    return null;
  }
  return null;
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 6, pb: 6 }}>
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
        </Stack>

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
              right={<ReportTag>Grad-CAM</ReportTag>}
            >
              <HeatmapOverlayCard
                originalSrc={`${process.env.BACKEND_API_URL}/${item.originalImageUrl}`}
                heatmapSrc={`${process.env.BACKEND_API_URL}/${item.heatmapImageUrl}`}
              />
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
      </Container>
    </Box>
  );
}
