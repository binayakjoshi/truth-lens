"use client";
import { useState } from "react";

import Image from "next/image";
import NextLink from "next/link";

import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import { Box, Paper, Stack, Typography } from "@mui/material";

import VerdictBadge from "@/components/dashboard/verdict-badge";
import { getManipulationScore, resolveAssetUrl } from "@/lib/analysis-utils";
import { type AnalysisHistory } from "@/types/type";

import Timestamp from "./timestamp";

function Thumbnail({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.disabled",
          flexShrink: 0,
        }}
      >
        <ImageNotSupportedOutlinedIcon fontSize="small" />
      </Box>
    );
  }
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1.5,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="40px"
        style={{ objectFit: "cover" }}
        onError={() => setFailed(true)}
      />
    </Box>
  );
}

export default function CaseLog({ cases }: { cases: AnalysisHistory[] }) {
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
                <Box component="td" sx={{ px: 3, py: 1.5, width: "44%" }}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center" }}
                  >
                    <Thumbnail
                      src={resolveAssetUrl(c.originalImageUrl)}
                      alt={`Case ${c.id}`}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontFamily: "var(--font-mono, monospace)",
                      }}
                      noWrap
                    >
                      #{c.id.slice(0, 8)}
                    </Typography>
                  </Stack>
                </Box>
                <Box component="td" sx={{ px: 3, py: 1.5 }}>
                  <VerdictBadge verdict={c.classification} />
                </Box>
                <Box component="td" sx={{ px: 3, py: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "var(--font-mono, monospace)" }}
                  >
                    {getManipulationScore(c)}%
                  </Typography>
                </Box>
                <Box component="td" sx={{ px: 3, py: 1.5, textAlign: "right" }}>
                  <Timestamp
                    iso={c.createdAt}
                    variant="caption"
                    color="text.secondary"
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
