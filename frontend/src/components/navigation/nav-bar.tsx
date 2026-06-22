import Image from "next/image";
import Link from "next/link";

import { Box, Button, Typography } from "@mui/material";

import { fetchCurrentUser } from "@/lib/user";

import ThemeToggle from "../ui/theme-toggle";
import LogoutModal from "../users/logout-modal";

const NavBar = async () => {
  const user = await fetchCurrentUser();
  console.log(user);
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
            width: 40,
            height: 40,
            borderRadius: "50%", // circular
            overflow: "hidden", // clips the image to the circle
            flexShrink: 0,
            position: "relative",
          }}
        >
          <Image
            alt="logo"
            src="/icon.png"
            fill // fills the parent Box
            style={{ objectFit: "cover" }}
            sizes="40px"
          />
        </Box>
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
