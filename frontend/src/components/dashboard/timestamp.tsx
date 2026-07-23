"use client";

import { Typography, type TypographyProps } from "@mui/material";

import { formatTimestamp } from "@/lib/analysis-utils";

type TimestampProps = {
  iso?: string;
} & TypographyProps;

export default function Timestamp({ iso, ...props }: TimestampProps) {
  const text = formatTimestamp(iso);

  return <Typography {...props}>{text}</Typography>;
}
