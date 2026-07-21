"use client";

import { useState } from "react";
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

function classificationLabel(
  classification: AnalysisHistory["classification"],
) {
  switch (classification) {
    case "real":
      return "Authentic";
    case "fake":
      return "Manipulated";
    default:
      return "Uncertain";
  }
}

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const LEGEND = [
  { key: "real", label: "Authentic", color: "var(--authentic-color)" },
  { key: "uncertain", label: "Uncertain", color: "var(--uncertain-color)" },
  { key: "fake", label: "Manipulated", color: "var(--manipulated-color)" },
] as const;

export default function ConfidenceMeter({
  cases,
}: {
  cases: AnalysisHistory[];
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const hovered = cases.find((c) => c.id === hoveredId) ?? null;
  const hoveredConfidence = hovered ? getManipulationScore(hovered) : 0;

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
          mb: 2.5,
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Confidence Spectrum
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manipulation score across recent scans
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontFamily: "var(--font-mono, monospace)",
            whiteSpace: "nowrap",
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
        {/* Fixed-height wrapper: geometry never changes on hover, only opacity does */}
        <Box sx={{ position: "relative", pt: 4.5 }}>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: `${hoveredConfidence}%`,
              transform: "translateX(-50%)",
              bgcolor: "grey.900",
              color: "common.white",
              borderRadius: 1.5,
              px: 1.5,
              py: 0.75,
              fontSize: 12,
              lineHeight: 1.4,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 1,
              boxShadow: 3,
              opacity: hovered ? 1 : 0,
              visibility: hovered ? "visible" : "hidden",
              transition: "opacity 0.1s ease",
            }}
          >
            {hovered && (
              <>
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{
                    mb: 0.25,

                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: markerColor(hovered.classification),
                    }}
                  />
                  <Typography
                    sx={{ fontSize: 12, fontWeight: 600, color: "inherit" }}
                  >
                    {classificationLabel(hovered.classification)} ·{" "}
                    {hoveredConfidence}%
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: 11, color: "grey.400" }}>
                  {formatTimestamp(hovered.createdAt)}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "grey.400" }} noWrap>
                  {getFilename(hovered.originalImageUrl)}
                </Typography>
              </>
            )}
          </Box>

          <Box
            component="svg"
            viewBox="0 0 100 24"
            preserveAspectRatio="none"
            sx={{
              width: "100%",
              height: 72,
              display: "block",
              overflow: "visible",
            }}
          >
            {/* Score-zone background bands */}
            <rect
              x={0}
              y={8}
              width={33.34}
              height={8}
              fill="var(--authentic-color)"
              opacity={0.08}
            />
            <rect
              x={33.34}
              y={8}
              width={33.32}
              height={8}
              fill="var(--uncertain-color)"
              opacity={0.08}
            />
            <rect
              x={66.66}
              y={8}
              width={33.34}
              height={8}
              fill="var(--manipulated-color)"
              opacity={0.08}
            />

            {/* Baseline */}
            <line
              x1={0}
              x2={100}
              y1={12}
              y2={12}
              stroke="currentColor"
              strokeOpacity={0.12}
              strokeWidth={0.5}
            />

            {/* Zone dividers */}
            <line
              x1={33.34}
              x2={33.34}
              y1={9}
              y2={15}
              stroke="currentColor"
              strokeOpacity={0.15}
              strokeWidth={0.4}
            />
            <line
              x1={66.66}
              x2={66.66}
              y1={9}
              y2={15}
              stroke="currentColor"
              strokeOpacity={0.15}
              strokeWidth={0.4}
            />

            {cases.map((c) => {
              const confidence = getManipulationScore(c);
              const isHovered = hoveredId === c.id;
              return (
                <g key={c.id}>
                  {/* Visible marker — radius is fixed so hovering never changes SVG geometry */}
                  <circle
                    cx={confidence}
                    cy={12}
                    r={1.6}
                    fill={markerColor(c.classification)}
                    opacity={isHovered ? 1 : 0.85}
                    stroke={isHovered ? "#fff" : "none"}
                    strokeWidth={isHovered ? 0.5 : 0}
                    style={{ pointerEvents: "none" }}
                  />
                  {/* Invisible larger hit target — this is what listens for hover */}
                  <circle
                    cx={confidence}
                    cy={12}
                    r={4}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredId(c.id)}
                    onMouseLeave={() =>
                      setHoveredId((prev) => (prev === c.id ? null : prev))
                    }
                  />
                </g>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Stack direction="row" sx={{ mt: 1, justifyContent: "space-between" }}>
        <Typography variant="caption" color="text.secondary">
          0%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          50%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          100%
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2.5} sx={{ mt: 2 }}>
        {LEGEND.map(({ key, label, color }) => (
          <Stack
            key={key}
            direction="row"
            spacing={0.75}
            sx={{
              alignItems: "center",
            }}
          >
            <Box
              sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }}
            />
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {cases.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
          No scans yet — run your first analysis to populate this chart.
        </Typography>
      )}
    </Paper>
  );
}
