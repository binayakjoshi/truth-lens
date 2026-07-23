import { type ReactNode } from "react";

import { Box, Divider, Stack, Typography } from "@mui/material";

interface ReportCardProps {
  icon: ReactNode;
  title: string;
  right?: ReactNode;
  children: ReactNode;
}

export default function ReportCard({
  icon,
  title,
  right,
  children,
}: ReportCardProps) {
  return (
    <Stack
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 1.75,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
            {title}
          </Typography>
        </Stack>
        {right}
      </Stack>
      <Divider />
      <Box sx={{ p: 2.5, flex: 1 }}>{children}</Box>
    </Stack>
  );
}
