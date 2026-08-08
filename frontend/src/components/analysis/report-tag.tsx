import { Box } from "@mui/material";

export default function ReportTag({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.4,
        borderRadius: 999,
        bgcolor: "action.selected",
        fontSize: "0.7rem",
        fontWeight: 600,
      }}
    >
      {children}
    </Box>
  );
}
