import Image from "next/image";

import { Box, Paper, Typography } from "@mui/material";

import { type AnalysisHistory } from "@/types/type";

interface AnalysisHistoryCardProps {
  item: AnalysisHistory;
  view?: "grid" | "list";
}

export default function AnalysisHistoryCard({
  item,
  view = "grid",
}: AnalysisHistoryCardProps) {
  const isFake = item.classification === "fake";
  const confidencePercent = (item.confidence * 100).toFixed(1);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(item.createdAt));
  const accent = isFake ? "error.main" : "success.main";
  if (view === "list") {
    return (
      <Paper
        elevation={0}
        component="a"
        href={`/history/${item.id}`}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          textDecoration: "none",
          color: "inherit",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 1.25,
          transition: "border-color 150ms ease",
          "&:hover": { borderColor: accent },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: 64,
            height: 64,
            flexShrink: 0,
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: "action.hover",
          }}
        >
          <Image
            src={`http://backend:5000/${item.originalImageUrl}`}
            alt={`Analysis ${item.id}`}
            fill
            sizes="64px"
            style={{ objectFit: "cover" }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            minWidth: 70,
          }}
        >
          <Box
            sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: accent }}
          />
          <Typography
            sx={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {isFake ? "Fake" : "Real"}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: "0.85rem",
            fontWeight: 700,
            minWidth: 60,
          }}
        >
          {confidencePercent}%
        </Typography>

        <Typography
          sx={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: "0.75rem",
            color: "text.secondary",
            ml: "auto",
          }}
        >
          {formattedDate}
        </Typography>
      </Paper>
    );
  }
  return (
    <Paper
      elevation={0}
      component="a"
      href={`/history/${item.id}`}
      sx={{
        position: "relative",
        display: "block",
        textDecoration: "none",
        color: "inherit",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        transition: "border-color 150ms ease, transform 150ms ease",
        "&:hover": {
          borderColor: accent,
          transform: "translateY(-2px)",
        },
        "&:hover .scan-corner": { opacity: 1 },
      }}
    >
      {/* corner brackets — scan/forensic accent, only visible on hover */}
      {[
        { top: 6, left: 6, borderWidth: "2px 0 0 2px" },
        { top: 6, right: 6, borderWidth: "2px 2px 0 0" },
        { bottom: 6, left: 6, borderWidth: "0 0 2px 2px" },
        { bottom: 6, right: 6, borderWidth: "0 2px 2px 0" },
      ].map((pos, i) => (
        <Box
          key={i}
          className="scan-corner"
          sx={{
            position: "absolute",
            width: 14,
            height: 14,
            borderColor: accent,
            borderStyle: "solid",
            opacity: 0,
            transition: "opacity 150ms ease",
            zIndex: 2,
            pointerEvents: "none",
            ...pos,
          }}
        />
      ))}

      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          bgcolor: "action.hover",
        }}
      >
        <Image
          src={`${process.env.BACKEND_API_URL}/${item.originalImageUrl}`}
          alt={`Analysis ${item.id}`}
          fill
          sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 20vw"
          style={{ objectFit: "cover" }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 0.9,
            py: 0.3,
            borderRadius: 0.5,
            bgcolor: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(2px)",
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: accent,
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: "common.white",
              textTransform: "uppercase",
            }}
          >
            {isFake ? "Fake" : "Real"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 1.25, py: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: "0.7rem",
              color: "text.secondary",
            }}
          >
            conf.
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            {confidencePercent}%
          </Typography>
        </Box>
        <Typography
          sx={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: "0.65rem",
            color: "text.secondary",
            mt: 0.25,
          }}
        >
          {formattedDate}
        </Typography>
      </Box>
    </Paper>
  );
}
