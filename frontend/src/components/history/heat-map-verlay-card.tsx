// components/HeatmapOverlayCard.tsx
"use client";

import { useState } from "react";

import Image from "next/image";

import { Box, Stack, Slider, Typography } from "@mui/material";

interface HeatmapOverlayCardProps {
  originalSrc: string;
  heatmapSrc: string;
}

export default function HeatmapOverlayCard({
  originalSrc,
  heatmapSrc,
}: HeatmapOverlayCardProps) {
  const [opacity, setOpacity] = useState(80);

  return (
    <>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "action.hover",
        }}
      >
        {/* Base layer: original image */}
        <Image
          src={originalSrc}
          alt="Original upload"
          fill
          sizes="(max-width: 900px) 100vw, 380px"
          style={{ objectFit: "contain" }}
        />
        {/* Overlay layer: heatmap, opacity controlled by slider */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: opacity / 100,
            transition: "opacity 120ms linear",
            pointerEvents: "none",
          }}
        >
          <Image
            src={heatmapSrc}
            alt="Heatmap overlay"
            fill
            sizes="(max-width: 900px) 100vw, 380px"
            style={{ objectFit: "contain" }}
          />
        </Box>
      </Box>

      <Stack spacing={1} sx={{ mt: 2 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Heatmap Opacity
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {opacity}%
          </Typography>
        </Stack>
        <Slider
          value={opacity}
          onChange={(_, value) => setOpacity(value)}
          size="small"
          min={0}
          max={100}
        />
      </Stack>
    </>
  );
}
