import { type NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const refreshToken = req.cookies.get("truth-refresh-token")?.value;
  const verificationEmail = req.cookies.get("truth-verification-email")?.value;
  const { pathname } = req.nextUrl;

  const authRoutes = ["/login", "/signup"];

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (refreshToken && isAuthRoute)
    return NextResponse.redirect(new URL("/", req.url));

  if (!verificationEmail && pathname.startsWith("/verify-otp"))
    return NextResponse.redirect(new URL("/login", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
};
