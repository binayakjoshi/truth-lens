"use client";
import Link from "next/link";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { IconButton, Tooltip } from "@mui/material";

type Sort = "ASC" | "DESC";

interface SortToggleProps {
  sort: Sort;
  page: number;
  limit: number;
  view: string;
}

export default function SortToggle({
  sort,
  page,
  limit,
  view,
}: SortToggleProps) {
  const nextSort: Sort = sort === "DESC" ? "ASC" : "DESC";
  const href = `/history?page=${page}&limit=${limit}&view=${view}&sort=${nextSort}`;

  return (
    <Tooltip title={sort === "DESC" ? "Newest first" : "Oldest first"}>
      <IconButton
        component={Link}
        href={href}
        size="small"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          color: "text.secondary",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        {sort === "DESC" ? (
          <ArrowDownwardIcon fontSize="small" />
        ) : (
          <ArrowUpwardIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
