export const parseSetCookieToCookieString = (
  setCookieHeaders: string[],
): string => {
  return setCookieHeaders.map((header) => header.split(";")[0]).join("; ");
};

export const fetchAndRefresh = async (
  input: RequestInfo,
  init: RequestInit = {},
  cookieHeader?: string,
): Promise<{ res: Response; newCookie?: string[] | null }> => {
  const mergedInit: RequestInit = {
    ...init,
    credentials: "include",
  };

  const doFetch = (cookie?: string) => {
    const headers = new Headers(mergedInit.headers);
    if (cookie) headers.set("cookie", cookie);
    return fetch(input, { ...mergedInit, headers });
  };

  const res = await doFetch(cookieHeader);

  if (res.status === 401) {
    try {
      const refreshRes = await fetch(
        `${process.env.BACKEND_API_URL}/auth/refresh`,
        {
          credentials: "include",
          headers: {
            ...(cookieHeader ? { cookie: cookieHeader } : {}),
          },
        },
      );

      if (refreshRes.ok) {
        const setCookieHeaders = refreshRes.headers.getSetCookie();

        const retryCookieString =
          parseSetCookieToCookieString(setCookieHeaders);

        const retryResponse = await doFetch(retryCookieString);
        const retryCookies = retryResponse.headers.getSetCookie();
        return {
          res: retryResponse,
          newCookie: retryCookies.length > 0 ? retryCookies : setCookieHeaders,
        };
      }
    } catch (err) {
      console.error("refresh failed. Please try again.", err);
    }
  }
  const newCookie = res.headers.getSetCookie();
  return { res: res, newCookie: newCookie.length > 0 ? newCookie : null };
};
