import { cookies } from "next/headers";

import HomePageClient from "@/components/home-page-client";
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

  return <HomePageClient user={user} />;
}
