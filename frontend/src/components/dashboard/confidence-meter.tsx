"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";

import { type CaseRecord } from "@/lib/dashboard";

function markerColor(confidence: number) {
  if (confidence < 30) return "var(--authentic-color)";
  if (confidence < 70) return "var(--uncertain-color)";
  return "var(--manipulated-color)";
}

export default function ConfidenceMeter({ cases }: { cases: CaseRecord[] }) {
  return (
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
      <Stack
        direction="row"
        sx={{
          mb: 2,

          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Confidence Spectrum
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          {cases.length} recent scan{cases.length === 1 ? "" : "s"}
        </Typography>
      </Stack>

      <Box
        sx={(theme) => ({
          "--authentic-color": theme.palette.success.main,
          "--uncertain-color": theme.palette.warning.main,
          "--manipulated-color": theme.palette.error.main,
        })}
      >
        <Box
          component="svg"
          viewBox="0 0 100 32"
          preserveAspectRatio="none"
          sx={{ width: "100%", height: 96, display: "block" }}
        >
          {/* zone bands */}
          <rect
            x={0}
            y={13}
            width={30}
            height={4}
            fill="var(--authentic-color)"
            opacity={0.22}
          />
          <rect
            x={30}
            y={13}
            width={40}
            height={4}
            fill="var(--uncertain-color)"
            opacity={0.22}
          />
          <rect
            x={70}
            y={13}
            width={30}
            height={4}
            fill="var(--manipulated-color)"
            opacity={0.22}
          />

          {/* case ticks */}
          {cases.map((c) => (
            <line
              key={c.id}
              x1={c.confidence}
              x2={c.confidence}
              y1={4}
              y2={26}
              stroke={markerColor(c.confidence)}
              strokeWidth={0.6}
              opacity={0.9}
            >
              <title>{`${c.filename} — ${c.confidence}%`}</title>
            </line>
          ))}
        </Box>
      </Box>

      <Stack direction="row" sx={{ mt: 1, justifyContent: "space-between" }}>
        <Typography
          variant="caption"
          sx={{
            color: "success.main",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          0% Authentic
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "warning.main",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          Uncertain
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "error.main",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          100% Manipulated
        </Typography>
      </Stack>

      {cases.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
          No scans yet — run your first analysis to populate this chart.
        </Typography>
      )}
    </Paper>
  );
}
