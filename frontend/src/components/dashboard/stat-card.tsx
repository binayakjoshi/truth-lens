import { Paper, Typography } from "@mui/material";

import AnimatedCounter from "@/components/dashboard/animated-counter";

type Tone = "default" | "success" | "warning" | "error";

export default function StatCard({
  label,
  value,
  suffix = "",
  tone = "default",
}: {
  label: string;
  value: number;
  suffix?: string;
  tone?: Tone;
}) {
  const accentColor = tone === "default" ? "text.primary" : `${tone}.main`;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        borderTop: "3px solid",
        borderTopColor: accentColor,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="h3"
        sx={{
          mt: 1,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          fontFamily: "var(--font-mono, monospace)",
          color: accentColor,
        }}
      >
        <AnimatedCounter value={value} suffix={suffix} />
      </Typography>
    </Paper>
  );
}
