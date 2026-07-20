import { cookies } from "next/headers";

import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Box, Container, Grid, Paper, Stack, Typography } from "@mui/material";

import LinkButton from "@/components/custom-elements/link-button";
import CaseLog from "@/components/dashboard/case-log";
import ConfidenceMeter from "@/components/dashboard/confidence-meter";
import LiveStatusBadge from "@/components/dashboard/live-status-badge";
import StatCard from "@/components/dashboard/stat-card";
import { getDashboardStats, getRecentCases } from "@/lib/dashboard";
import { type User } from "@/types/type";

async function getUser(cookieHeader: string): Promise<User | null> {
  try {
    const res = await fetch(`${process.env.PROXY_API_URL}/api/auth/me`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
    if (res.ok) {
      const resData = await res.json();
      return resData.data;
    }
  } catch {
    return null;
  }
  return null;
}

export default async function Home() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const user = await getUser(cookieHeader);

  const [stats, cases] = user
    ? await Promise.all([
        getDashboardStats(cookieHeader),
        getRecentCases(cookieHeader, 6),
      ])
    : [null, []];

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
      <Container maxWidth="lg" sx={{ pt: 10, pb: 6, flex: 1 }}>
        {!user ? (
          <Box sx={{ textAlign: "center", maxWidth: 800, mx: "auto", mt: 8 }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "3rem", md: "4.5rem" },
                lineHeight: 1.1,
                mb: 3,
                letterSpacing: "-0.02em",
              }}
            >
              See through the artificial.
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                mb: 6,
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Enterprise-grade deepfake detection with Grad-CAM explainability.
              Upload media and receive instant authenticity analysis designed
              for professionals.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ justifyContent: "center" }}
            >
              <LinkButton
                href="/analysis"
                variant="contained"
                size="large"
                disableElevation
                sx={{ px: 4, py: 1.5, fontSize: "1rem", minWidth: 200 }}
              >
                Start Analysis
              </LinkButton>
              <LinkButton
                href="/login"
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  borderColor: "divider",
                  color: "text.primary",
                  minWidth: 200,
                }}
              >
                Workspace Login
              </LinkButton>
            </Stack>
          </Box>
        ) : (
          <Box>
            {/* Masthead */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
              sx={{ mb: 5 }}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: "text.secondary", letterSpacing: "0.12em" }}
                >
                  Forensic Workspace
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 600, letterSpacing: "-0.02em" }}
                >
                  Welcome back, {user.username}
                </Typography>
              </Box>

              <LiveStatusBadge
                initialServices={[
                  { name: "Forensic Engine", status: "online" },
                  { name: "Metadata Extractor", status: "online" },
                ]}
              />
            </Stack>

            {/* Metrics row */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard label="Total Scans" value={stats?.totalScans ?? 0} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  label="Flagged as Manipulated"
                  value={stats?.manipulatedCount ?? 0}
                  tone="error"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  label="Verified Authentic"
                  value={stats?.authenticCount ?? 0}
                  tone="success"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  label="Avg. Manipulation Score"
                  value={stats?.avgConfidence ?? 0}
                  suffix="%"
                  tone="warning"
                />
              </Grid>
            </Grid>

            {/* Main content */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={3}>
                  <ConfidenceMeter cases={cases} />
                  <CaseLog cases={cases} />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.25,
                        width: "fit-content",
                        borderRadius: 2,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        mb: 2,
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      New Analysis
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2.5 }}
                    >
                      Upload media for deepfake inspection and metadata
                      extraction.
                    </Typography>
                    <LinkButton
                      href="/analysis"
                      variant="contained"
                      disableElevation
                      fullWidth
                    >
                      Upload Media
                    </LinkButton>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.25,
                        width: "fit-content",
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        color: "text.primary",
                        mb: 2,
                      }}
                    >
                      <UploadFileIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Bulk Upload
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2.5 }}
                    >
                      Analyze multiple files in a single batch request.
                    </Typography>
                    <LinkButton href="/bulk-analysis" variant="outlined" fullWidth>
                      Upload Batch
                    </LinkButton>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.25,
                        width: "fit-content",
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        color: "text.primary",
                        mb: 2,
                      }}
                    >
                      <HistoryIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Full History
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2.5 }}
                    >
                      Browse every past report and forensic case.
                    </Typography>
                    <LinkButton href="/history" variant="outlined" fullWidth>
                      View History
                    </LinkButton>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
}
