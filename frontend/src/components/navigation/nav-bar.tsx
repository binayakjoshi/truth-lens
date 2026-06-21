import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";
import ThemeToggle from "../ui/theme-toggle";
import LogoutModal from "../users/logout-modal";
import { fetchCurrentUser } from "@/lib/user";

const NavBar = async () => {
  const user = await fetchCurrentUser();
  return (
    <Box
      component="header"
      sx={{
        py: 2,
        px: { xs: 3, md: 6 },
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: 1,
            bgcolor: "primary.main",
          }}
        />
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, letterSpacing: "-0.02em" }}
        >
          TruthLens
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <ThemeToggle />
        {user ? (
          <LogoutModal />
        ) : (
          <>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <Button color="inherit" sx={{ fontWeight: 500 }}>
                Log in
              </Button>
            </Link>
            <Link href="/signup" style={{ textDecoration: "none" }}>
              <Button variant="contained" color="primary" disableElevation>
                Get Started
              </Button>
            </Link>
          </>
        )}
      </Box>
    </Box>
  );
};
export default NavBar;
