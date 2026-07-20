import { Box, Typography } from "@mui/material";

import { type Verdict } from "@/lib/dashboard";

const VERDICT_COPY: Record<Verdict, string> = {
  authentic: "Authentic",
  uncertain: "Uncertain",
  manipulated: "Manipulated",
};

const VERDICT_COLOR: Record<Verdict, "success" | "warning" | "error"> = {
  authentic: "success",
  uncertain: "warning",
  manipulated: "error",
};

export default function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const color = VERDICT_COLOR[verdict];

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1.25,
        py: 0.25,
        borderRadius: 1,
        border: "1px solid",
        borderColor: `${color}.main`,
        transform: verdict === "manipulated" ? "rotate(-1.5deg)" : "none",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontFamily: "var(--font-mono, monospace)",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: `${color}.main`,
          fontSize: "0.7rem",
        }}
      >
        {VERDICT_COPY[verdict]}
      </Typography>
    </Box>
  );
}
