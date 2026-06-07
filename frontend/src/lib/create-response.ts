import { NextResponse } from "next/server";

const updateCookies = (res: NextResponse, newCookies?: string[] | null) => {
  if (newCookies && newCookies.length > 0) {
    newCookies.forEach((cookieStr) => {
      res.headers.append("Set-Cookie", cookieStr);
    });
  }
  return res;
};

export const createResponse = (
  res: Response,
  data: any,
  newCookie?: string[] | null,
) => {
  const updatedRes = NextResponse.json(data, { status: res.status });
  return updateCookies(updatedRes, newCookie);
};

export const createFileResponse = (
  res: Response,
  buffer: ArrayBuffer,
  filename: string,
  newCookie?: string[] | null,
) => {
  const contentType =
    res.headers.get("content-type") || "application/octet-stream";

  const updateRes = new NextResponse(buffer, {
    status: res.status,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });

  return updateCookies(updateRes, newCookie);
};
