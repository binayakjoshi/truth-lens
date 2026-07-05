const isDev = process.env.NODE_ENV !== 'production';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'truth-access-token',
  REFRESH_TOKEN: 'truth-refresh-token',
  VERIFICATION_TOKEN: 'truth-verification-token',
} as const;

export const COOKIE_OPTIONS = {
  ACCESS: {
    httpOnly: true,
    sameSite: isDev ? ('lax' as const) : ('none' as const),
    secure: !isDev,
    maxAge: 10 * 60 * 1000,
    path: '/',
  },
  REFRESH: {
    httpOnly: true,
    sameSite: isDev ? ('lax' as const) : ('none' as const),
    secure: !isDev,
    maxAge: 12 * 60 * 60 * 1000,
    path: '/',
  },

  VERIFICATION: {
    httpOnly: true,
    sameSite: isDev ? ('lax' as const) : ('none' as const),
    secure: !isDev,
    maxAge: 10 * 60 * 1000,
    path: '/',
  },
} as const;
