"use client";

import Image from "next/image";

import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface HeatSignatureProps {
  size?: number;
}

const HeatSignature = ({ size = 220 }: HeatSignatureProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        maxWidth: "100%",
        aspectRatio: "1 / 1",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        bgcolor: "action.hover",
      }}
    >
      <Image
        src="/example.png"
        alt="Example face analyzed by TruthLens"
        fill
        sizes="(max-width: 900px) 100vw, 280px"
        style={{ objectFit: "contain" }}
      />

      {/* Heatmap tint, revealed top-to-bottom on a loop — same direction as the real opacity slider */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          mixBlendMode: "hard-light",
          pointerEvents: "none",
          background: `
            radial-gradient(circle at 36% 34%, ${theme.palette.error.main} 0%, transparent 20%),
            radial-gradient(circle at 64% 34%, ${theme.palette.error.main} 0%, transparent 20%),
            radial-gradient(circle at 50% 66%, ${theme.palette.warning.main} 0%, transparent 24%)
          `,
          opacity: 0.8,
          "@keyframes revealDown": {
            "0%": { clipPath: "inset(0 0 100% 0)" },
            "45%": { clipPath: "inset(0 0 0% 0)" },
            "55%": { clipPath: "inset(0 0 0% 0)" },
            "100%": { clipPath: "inset(0 0 100% 0)" },
          },
          animation: "revealDown 4.5s ease-in-out infinite",
        }}
      />

      {/* Scan line at the reveal boundary, synced to the same animation */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 2,
          pointerEvents: "none",
          background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.warning.main}, ${theme.palette.error.main})`,
          boxShadow: `0 0 8px ${theme.palette.error.main}`,
          "@keyframes scanLine": {
            "0%": { top: "0%" },
            "45%": { top: "100%" },
            "55%": { top: "100%" },
            "100%": { top: "0%" },
          },
          animation: "scanLine 4.5s ease-in-out infinite",
        }}
      />
    </Box>
  );
};

export default HeatSignature;
