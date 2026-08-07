import { type NextRequest, NextResponse } from "next/server";

import { createFileResponse } from "@/lib/create-response";
import { fetchAndRefresh } from "@/lib/custom-fetch";

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const { searchParams } = new URL(request.url);

    const query = searchParams.toString();

    const { res, newCookie } = await fetchAndRefresh(
      `${process.env.BACKEND_API_URL}/analysis/export?${query}`,
      { method: "GET" },
      cookieHeader,
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));

      const response = NextResponse.json(data, {
        status: res.status,
      });

      if (newCookie) {
        newCookie.forEach((cookie) => {
          response.headers.append("Set-Cookie", cookie);
        });
      }

      return response;
    }

    const buffer = await res.arrayBuffer();

    const contentDisposition = res.headers.get("content-disposition") ?? "";
    const filename =
      contentDisposition.match(/filename="?([^"]+)"?/)?.[1] ??
      "analysis-report.pdf";

    return createFileResponse(res, buffer, filename, newCookie);
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message ?? "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
