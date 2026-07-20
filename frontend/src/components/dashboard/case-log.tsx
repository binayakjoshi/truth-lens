"use client";
import NextLink from "next/link";

import { Box, Paper, Stack, Typography } from "@mui/material";

import VerdictBadge from "@/components/dashboard/verdict-badge";
import { type CaseRecord } from "@/lib/dashboard";

function formatTimestamp(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function CaseLog({ cases }: { cases: CaseRecord[] }) {
  return (
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
      <Stack
        direction="row"
        sx={{
          px: 3,
          pt: 3,
          pb: 2,

          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Case Log
        </Typography>
        <Typography
          component={NextLink}
          href="/history"
          variant="body2"
          sx={{
            color: "primary.main",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          View all →
        </Typography>
      </Stack>

      {cases.length === 0 ? (
        <Box sx={{ px: 3, pb: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Nothing analyzed yet. Upload a file to open your first case.
          </Typography>
        </Box>
      ) : (
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <Box component="tbody">
            {cases.map((c) => (
              <Box
                component="tr"
                key={c.id}
                sx={{
                  "&:not(:last-of-type)": {
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  },
                }}
              >
                <Box component="td" sx={{ px: 3, py: 1.75, width: "44%" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {c.filename}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontFamily: "var(--font-mono, monospace)",
                    }}
                  >
                    #{c.id}
                  </Typography>
                </Box>
                <Box component="td" sx={{ px: 3, py: 1.75 }}>
                  <VerdictBadge verdict={c.verdict} />
                </Box>
                <Box component="td" sx={{ px: 3, py: 1.75 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "var(--font-mono, monospace)" }}
                  >
                    {c.confidence}%
                  </Typography>
                </Box>
                <Box
                  component="td"
                  sx={{ px: 3, py: 1.75, textAlign: "right" }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {formatTimestamp(c.createdAt)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
