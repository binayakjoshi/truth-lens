import { cookies } from "next/headers";
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export const fetchCurrentUser = async () => {
  let user: User | null = null;

  const cookieStore = await cookies();
  try {
    const res = await fetch(`${process.env.PROXY_API_URL}/api/auth/me`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const resData = await res.json();
      user = resData.data;
    }
  } catch {
    user = null;
  }
  return user;
};
