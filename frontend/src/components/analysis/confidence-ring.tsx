"use client";

import { Box, Typography } from "@mui/material";

const RING_SIZE = 168;
const RING_R = 66;
const RING_STROKE = 16;
const RING_CX = RING_SIZE / 2;
const RING_CY = RING_SIZE / 2;
const GAP_DEG = 6;

function polarToCartesian(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: RING_CX + RING_R * Math.cos(rad),
    y: RING_CY + RING_R * Math.sin(rad),
  };
}

function describeArc(startDeg: number, endDeg: number): string {
  if (endDeg <= startDeg) return "";
  const start = polarToCartesian(startDeg);
  const end = polarToCartesian(endDeg);
  const largeArcFlag = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RING_R} ${RING_R} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

interface ConfidenceRingProps {
  realPercent: number;
  fakePercent: number;
  confidencePercent: number;
  label: string;
}

export default function ConfidenceRing({
  realPercent,
  confidencePercent,
  label,
}: ConfidenceRingProps) {
  const realDeg = (realPercent / 100) * 360;
  const realStart = GAP_DEG / 2;
  const realEnd = Math.max(realStart, realDeg - GAP_DEG / 2);
  const fakeStart = Math.min(360 - GAP_DEG / 2, realDeg + GAP_DEG / 2);
  const fakeEnd = 360 - GAP_DEG / 2;

  return (
    <Box sx={{ position: "relative", width: RING_SIZE, height: RING_SIZE }}>
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      >
        <circle
          cx={RING_CX}
          cy={RING_CY}
          r={RING_R}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth={RING_STROKE}
        />
        <path
          d={describeArc(realStart, realEnd)}
          fill="none"
          stroke="var(--mui-palette-primary-main, #4338ca)"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
        />
        <path
          d={describeArc(fakeStart, fakeEnd)}
          fill="none"
          stroke="var(--mui-palette-error-main, #d32f2f)"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
        />
      </svg>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "1.8rem",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {confidencePercent}
          <Typography
            component="span"
            sx={{ fontWeight: 800, fontSize: "1rem" }}
          >
            %
          </Typography>
        </Typography>
        <Typography
          variant="caption"
          sx={{ mt: 0.5, color: "text.secondary", fontSize: "0.75rem" }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}
