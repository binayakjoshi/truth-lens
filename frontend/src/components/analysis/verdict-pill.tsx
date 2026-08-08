import { Stack, Typography } from "@mui/material";

import { type StatusMeta } from "@/lib/analysis-report";

export default function VerdictPill({ meta }: { meta: StatusMeta }) {
  const { label, color, Icon } = meta;
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: "center",
        bgcolor: color,
        color: "#fff",
        borderRadius: 999,
        px: 2.5,
        py: 0.9,
      }}
    >
      <Icon sx={{ fontSize: "1.1rem" }} />
      <Typography
        sx={{
          fontWeight: 700,
          letterSpacing: "0.06em",
          fontSize: "0.8rem",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}
