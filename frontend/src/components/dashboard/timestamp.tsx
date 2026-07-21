"use client";

import { useEffect, useState } from "react";
import { Typography, TypographyProps } from "@mui/material";
import { formatTimestamp } from "@/lib/analysis-utils";

type TimestampProps = {
  iso?: string;
} & TypographyProps;

export default function Timestamp({ iso, ...props }: TimestampProps) {
  const [text, setText] = useState("—");

  useEffect(() => {
    setText(formatTimestamp(iso));
  }, [iso]);

  return <Typography {...props}>{text}</Typography>;
}
