import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * The browser can't call PROXY_API_URL directly (env var isn't exposed to
 * the client, and cross-origin cookies get messy), so LiveStatusBadge polls
 * this same-origin route instead, which proxies to the real backend.
 *
 * Adjust the upstream path/shape below to match your actual health-check
 * endpoint.
 */
export async function GET() {
  const cookieStore = await cookies();

  try {
    const res = await fetch(`${process.env.PROXY_API_URL}/api/health`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });

    if (res.ok) {
      const body = await res.json();
      return NextResponse.json({ services: body.data ?? body.services ?? [] });
    }
  } catch {
    // fall through to the conservative default below
  }

  return NextResponse.json({
    services: [
      { name: "Forensic Engine", status: "degraded" },
      { name: "Metadata Extractor", status: "degraded" },
    ],
  });
}
