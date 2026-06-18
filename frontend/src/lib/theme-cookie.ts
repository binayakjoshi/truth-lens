export const THEME_COOKIE = "truth-theme-mode";

export type ThemeMode = "light" | "dark";

export function parseThemeMode(value?: string | null): ThemeMode {
  return value === "light" ? "light" : "dark";
}

export function themeCookieMaxAge(): number {
  return 60 * 60 * 24 * 365;
}
