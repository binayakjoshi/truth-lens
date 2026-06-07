const isDev = process.env.NODE_ENV !== 'production';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'truth-access-token',
  REFRESH_TOKEN: 'truth-refresh-token',
} as const;

export const COOKIE_OPTIONS = {
  ACCESS: {
    httpOnly: true,
    sameSite: isDev ? ('lax' as const) : ('none' as const),
    secure: !isDev,
    maxAge: 2 * 60 * 1000,
    path: '/',
  },
  REFRESH: {
    httpOnly: true,
    sameSite: isDev ? ('lax' as const) : ('none' as const),
    secure: !isDev,
    maxAge: 4 * 60 * 1000, //7 * 24 * 60 * 60 * 1000,
    path: '/',
  },
} as const;
