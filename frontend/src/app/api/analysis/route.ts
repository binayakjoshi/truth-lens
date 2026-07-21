import { type NextRequest, NextResponse } from "next/server";

import { createResponse } from "@/lib/create-response";
import { fetchAndRefresh } from "@/lib/custom-fetch";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const cookieHeader = request.headers.get("cookie") ?? "";

    const { res, newCookie } = await fetchAndRefresh(
      `${process.env.BACKEND_API_URL}/analysis`,

      { method: "POST", body: formData },
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

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ?? "1";
    const sort = searchParams.get("sort") ?? "DESC";
    const limit = searchParams.get("limit") ?? "10";

    const { res, newCookie } = await fetchAndRefresh(
      `${process.env.BACKEND_API_URL}/analysis/history?page=${page}&sort=${sort}&limit=${limit}`,
      { method: "GET" },
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
