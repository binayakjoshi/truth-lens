"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

import {
  THEME_COOKIE,
  type ThemeMode,
  themeCookieMaxAge,
} from "@/lib/theme-cookie";
import { createAppTheme } from "@/theme";

type ThemeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function persistThemeMode(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.cookie = `${THEME_COOKIE}=${mode};path=/;max-age=${themeCookieMaxAge()};SameSite=Lax`;
}

export function ThemeProvider({
  initialMode,
  children,
}: {
  initialMode: ThemeMode;
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    persistThemeMode(nextMode);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((current) => {
      const nextMode = current === "dark" ? "light" : "dark";
      persistThemeMode(nextMode);
      return nextMode;
    });
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const value = useMemo(
    () => ({ mode, toggleMode, setMode }),
    [mode, toggleMode, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }
  return context;
}
