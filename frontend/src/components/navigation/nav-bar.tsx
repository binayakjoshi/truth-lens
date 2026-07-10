import Image from "next/image";
import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";
import { fetchCurrentUser } from "@/lib/user";
import ThemeToggle from "../ui/theme-toggle";
import UserMenu from "../users/user-menu";

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
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <Image
            alt="logo"
            src="/icon.png"
            fill
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
      </Link>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <ThemeToggle />
        {user ? (
          <UserMenu firstName={user.firstName} lastName={user.lastName} />
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
