"use client";

import Link from "next/link";

import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HistoryIcon from "@mui/icons-material/History";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { type User } from "@/context/user-context";

interface HomePageClientProps {
  user: User | null;
}

export default function HomePageClient({ user }: HomePageClientProps) {
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
              <Link href="/signup" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  size="large"
                  disableElevation
                  sx={{ px: 4, py: 1.5, fontSize: "1rem", minWidth: 200 }}
                >
                  Start Analysis
                </Button>
              </Link>
              <Link href="/login" style={{ textDecoration: "none" }}>
                <Button
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
                </Button>
              </Link>
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
                  <Link
                    href="/analysis"
                    style={{
                      textDecoration: "none",
                      width: "100%",
                      marginTop: "auto",
                    }}
                  >
                    <Button variant="contained" disableElevation fullWidth>
                      Upload Media
                    </Button>
                  </Link>
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

                  <Box sx={{ mt: "auto", width: "100%" }}>
                    <Link href="/history" style={{ textDecoration: "none" }}>
                      <Button variant="outlined" fullWidth>
                        View History
                      </Button>
                    </Link>
                  </Box>
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
