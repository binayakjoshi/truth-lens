const isDev = process.env.NODE_ENV !== 'production';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'truth-access-token',
  REFRESH_TOKEN: 'truth-refresh-token',
  VERIFICATION_EMAIL: 'truth-verification-email',
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

  VERIFICATION_EMAIL: {
    httpOnly: true,
    sameSite: isDev ? ('lax' as const) : ('none' as const),
    secure: !isDev,
    maxAge: 5 * 60 * 1000,
    path: '/',
  },
} as const;
