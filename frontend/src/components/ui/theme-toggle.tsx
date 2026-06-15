"use client";

import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { IconButton, Tooltip } from "@mui/material";

import { useThemeMode } from "@/context/theme-context";

export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();

  return (
    <Tooltip
      title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <IconButton
        aria-label="toggle theme"
        onClick={toggleMode}
        size="small"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        {mode === "dark" ? (
          <LightModeOutlinedIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
