import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const refreshToken = req.cookies.get("truth-refresh-token")?.value;
  const { pathname } = req.nextUrl;

  const authRoutes = ["/login", "/signup"];

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (refreshToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
};
