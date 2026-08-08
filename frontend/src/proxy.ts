import { type NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const refreshToken = req.cookies.get("truth-refresh-token")?.value;
  const verificationToken = req.cookies.get("truth-verification-token")?.value;
  const { pathname } = req.nextUrl;

  const authRoutes = [
    "/login",
    "/signup",
    "/verify-otp",
    "/forgot-password",
    "reset-password",
  ];
  const protectedRoutes = ["/history", "/bulk-analysis"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  if (refreshToken && isAuthRoute)
    return NextResponse.redirect(new URL("/", req.url));

  if (!verificationToken && pathname.startsWith("/reset-password"))
    return NextResponse.redirect(new URL("/login", req.url));

  if (!refreshToken && isProtectedRoute)
    return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
};
