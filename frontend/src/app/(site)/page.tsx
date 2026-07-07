import { cookies } from "next/headers";

import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HistoryIcon from "@mui/icons-material/History";
import { Box, Container, Grid, Paper, Stack, Typography } from "@mui/material";

import LinkButton from "@/components/custom-elements/link-button";
import { User } from "@/types/type";

async function getUser(): Promise<User | null> {
  const cookieStore = await cookies();
  try {
    const res = await fetch(`${process.env.PROXY_API_URL}/api/auth/me`, {
      headers: {
        Cookie: cookieStore.toString(),
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
  const user = await getUser();

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
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, mb: 1, letterSpacing: "-0.02em" }}
              >
                Overview
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back to your forensic workspace, {user.username}.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      mb: 2,
                    }}
                  >
                    <AddIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    New Analysis
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Upload new media for deepfake inspection and metadata
                    extraction.
                  </Typography>
                  <LinkButton
                    href="/analysis"
                    variant="contained"
                    disableElevation
                    fullWidth
                    sx={{ mt: "auto" }}
                  >
                    Upload Media
                  </LinkButton>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                      color: "text.primary",
                      mb: 2,
                    }}
                  >
                    <HistoryIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Recent Activity
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    View your past reports and forensic history.
                  </Typography>

                  <LinkButton
                    href="/history"
                    variant="outlined"
                    fullWidth
                    sx={{ mt: "auto" }}
                  >
                    View History
                  </LinkButton>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                      color: "text.primary",
                      mb: 2,
                    }}
                  >
                    <DashboardIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    System Status
                  </Typography>

                  <Box
                    sx={{
                      mt: 2,
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Forensic Engine
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "success.main", fontWeight: 600 }}
                      >
                        Online
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Metadata Extractor
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "success.main", fontWeight: 600 }}
                      >
                        Online
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
}
