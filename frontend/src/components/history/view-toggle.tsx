"use client";
import Link from "next/link";

import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import { Box, IconButton, Tooltip } from "@mui/material";

type View = "grid" | "list";

interface ViewToggleProps {
  view: View;
  page: number;
  limit: number;
}

export default function ViewToggle({ view, page, limit }: ViewToggleProps) {
  const buildHref = (v: View) =>
    `/history?page=${page}&limit=${limit}&view=${v}`;

  const options: { value: View; icon: React.ReactNode; label: string }[] = [
    {
      value: "grid",
      icon: <GridViewIcon fontSize="small" />,
      label: "Grid view",
    },
    {
      value: "list",
      icon: <ViewListIcon fontSize="small" />,
      label: "List view",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      {options.map((opt) => (
        <Tooltip key={opt.value} title={opt.label}>
          <IconButton
            component={Link}
            href={buildHref(opt.value)}
            size="small"
            sx={{
              borderRadius: 0,
              bgcolor: view === opt.value ? "action.selected" : "transparent",
              color: view === opt.value ? "primary.main" : "text.secondary",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            {opt.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
}
