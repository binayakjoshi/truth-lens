import { type NextRequest, NextResponse } from "next/server";

import { createResponse } from "@/lib/create-response";
import { fetchAndRefresh } from "@/lib/custom-fetch";

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";

    const { res, newCookie } = await fetchAndRefresh(
      `${process.env.BACKEND_API_URL}/users/stats`,
      {},
      cookieHeader,
    );

    const data = await res.json().catch(() => ({}));
    return createResponse(res, data, newCookie);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Something went wrong" },
      { status: 500 },
    );
  }
}
