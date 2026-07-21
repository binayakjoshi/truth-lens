import { cookies } from "next/headers";

import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Container, Grid, Paper, Stack, Typography } from "@mui/material";

import LinkButton from "@/components/custom-elements/link-button";
import CaseLog from "@/components/dashboard/case-log";
import ConfidenceMeter from "@/components/dashboard/confidence-meter";
import LiveStatusBadge from "@/components/dashboard/live-status-badge";
import StatCard from "@/components/dashboard/stat-card";
import { getDashboardStats, getRecentCases } from "@/lib/dashboard";
import { fetchCurrentUser } from "@/lib/user";

const quickActions = [
  {
    key: "single",
    icon: AddIcon,
    title: "New Analysis",
    description:
      "Upload media for deepfake inspection and metadata extraction.",
    href: "/analysis",
    label: "Upload Media",
    emphasis: true,
  },
  {
    key: "bulk",
    icon: UploadFileIcon,
    title: "Bulk Upload",
    description: "Analyze multiple files in a single batch request.",
    href: "/bulk-analysis",
    label: "Upload Batch",
    emphasis: false,
  },
  {
    key: "history",
    icon: HistoryIcon,
    title: "Full History",
    description: "Browse every past report and forensic case.",
    href: "/history",
    label: "View History",
    emphasis: false,
  },
] as const;

export default async function Home() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const user = await fetchCurrentUser();

  const [stats, cases] = await Promise.all([
    getDashboardStats(cookieHeader),
    getRecentCases(cookieHeader, 6),
  ]);

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
              spacing={2}
              sx={{
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                pb: 3,
                mb: 4,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
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

            {/* Primary metrics */}
            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard label="Total Scans" value={stats?.totalCount ?? 0} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                  label="Flagged as Manipulated"
                  value={stats?.fakeCount ?? 0}
                  tone="error"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                  label="Verified Authentic"
                  value={stats?.realCount ?? 0}
                  tone="success"
                />
              </Grid>
            </Grid>

            {/* Secondary metrics */}
            <Grid container spacing={2.5} sx={{ mb: 5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <StatCard
                  label="Avg. Manipulation Score"
                  value={
                    stats?.avgManupulationScore
                      ? stats.avgManupulationScore * 100
                      : 0
                  }
                  suffix="%"
                  tone="warning"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <StatCard
                  label="Uncertain"
                  value={stats?.uncertainCount ?? 0}
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
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ p: 3, pb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Quick Actions
                    </Typography>
                  </Box>

                  <Stack spacing={2} sx={{ px: 3, pb: 3 }}>
                    {quickActions.map(
                      ({
                        key,
                        icon: Icon,
                        title,
                        description,
                        href,
                        label,
                        emphasis,
                      }) => (
                        <Box
                          key={key}
                          sx={{
                            p: 2.5,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            transition: "all 0.15s ease",
                            "&:hover": {
                              bgcolor: "action.hover",
                              borderColor: "primary.main",
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            sx={{
                              alignItems: "flex-start",
                            }}
                          >
                            <Box
                              sx={{
                                p: 1.1,
                                borderRadius: 2,
                                bgcolor: emphasis
                                  ? "primary.main"
                                  : "action.selected",
                                color: emphasis
                                  ? "primary.contrastText"
                                  : "text.primary",
                                display: "flex",
                                flexShrink: 0,
                              }}
                            >
                              <Icon fontSize="small" />
                            </Box>

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600 }}
                              >
                                {title}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5, mb: 1.5 }}
                              >
                                {description}
                              </Typography>

                              <LinkButton
                                href={href}
                                variant={emphasis ? "contained" : "outlined"}
                                disableElevation={emphasis}
                                size="small"
                                endIcon={<ArrowForwardIcon fontSize="small" />}
                              >
                                {label}
                              </LinkButton>
                            </Box>
                          </Stack>
                        </Box>
                      ),
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
}
