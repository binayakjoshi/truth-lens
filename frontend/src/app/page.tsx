import { cookies } from "next/headers";
import Link from "next/link";

import HomeIcon from "@mui/icons-material/Home";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import LogoutModal from "@/components/users/logout-modal";
import { type User } from "@/context/user-context";
export default async function Home() {
  let user: User | null = null;

  const cookieStore = await cookies();

  try {
    const res = await fetch(`${process.env.PROXY_API_URL}/api/auth/me`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: "no-store",
    });

    if (res.ok) {
      const resData = await res.json();
      user = resData.data;
    }
  } catch {
    user = null;
  }

  return (
    <Stack spacing={2} sx={{ p: 4 }}>
      <Typography variant="h4">
        Welcome back : {user ? user.username : "Guest User"}
      </Typography>

      {user ? (
        <LogoutModal />
      ) : (
        <>
          <Link href="/login">
            <Button
              variant="contained"
              color="success"
              startIcon={<HomeIcon />}
            >
              Login
            </Button>
          </Link>

          <Link href="/signup">
            <Button variant="outlined" color="success" startIcon={<HomeIcon />}>
              Signup
            </Button>
          </Link>
        </>
      )}
    </Stack>
  );
}
