import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import HomeIcon from "@mui/icons-material/Home";

export default function Home() {
  return (
    <Stack spacing={2} sx={{ p: 4 }}>
      <Typography variant="h4">MUI + Next.js + Tailwind</Typography>

      <Button variant="contained" color="inherit" startIcon={<HomeIcon />}>
        Home
      </Button>
    </Stack>
  );
}
