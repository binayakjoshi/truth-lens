"use client";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { AnalysisHistory } from "@/types/type";
import { getManipulationScore, getFilename } from "@/lib/analysis-utils";

function markerColor(classification: AnalysisHistory["classification"]) {
  switch (classification) {
    case "real":
      return "var(--authentic-color)";
    case "fake":
      return "var(--manipulated-color)";
    default:
      return "var(--uncertain-color)";
  }
}

export default function ConfidenceMeter({
  cases,
}: {
  cases: AnalysisHistory[];
}) {
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
        sx={{ mb: 2, justifyContent: "space-between", alignItems: "baseline" }}
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
          viewBox="0 0 100 24"
          preserveAspectRatio="none"
          sx={{ width: "100%", height: 72, display: "block" }}
        >
          <line
            x1={0}
            x2={100}
            y1={12}
            y2={12}
            stroke="currentColor"
            strokeOpacity={0.12}
            strokeWidth={1}
          />
          {cases.map((c) => {
            const confidence = getManipulationScore(c);
            return (
              <circle
                key={c.id}
                cx={confidence}
                cy={12}
                r={1.6}
                fill={markerColor(c.classification)}
                opacity={0.9}
              >
                <title>{`${getFilename(c.originalImageUrl)} — ${confidence}%`}</title>
              </circle>
            );
          })}
        </Box>
      </Box>
      <Stack direction="row" sx={{ mt: 1, justifyContent: "space-between" }}>
        <Typography variant="caption" color="text.secondary">
          0%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Uncertain
        </Typography>
        <Typography variant="caption" color="text.secondary">
          100%
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
