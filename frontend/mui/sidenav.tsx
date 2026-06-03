"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { usePathname } from "next/navigation";
import Link from "next/link";
import AddIcon from "@mui/icons-material/Add";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PolicyIcon from "@mui/icons-material/Policy";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: "New Analysis", href: "/analysis/new", icon: <AnalyticsOutlinedIcon fontSize="small" /> },
  { label: "History", href: "/history", icon: <HistoryOutlinedIcon fontSize="small" /> },
  { label: "Reports", href: "/reports", icon: <DescriptionOutlinedIcon fontSize="small" /> },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: 256,
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        p: 2,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3, mt: 1, px: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PolicyIcon sx={{ color: "white", fontSize: 18 }} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "var(--font-playfair), serif",
              fontWeight: 900,
              color: "primary.light",
              lineHeight: 1,
              fontSize: "1.1rem",
            }}
          >
            TruthLens
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Forensic Workspace
          </Typography>
        </Box>
      </Box>

      {/* New Analysis CTA */}
      <Button
        component={Link}
        href="/analysis/new"
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        fullWidth
        sx={{ mb: 2, borderRadius: 1.5 }}
      >
        New Analysis
      </Button>

      {/* Nav Links */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Box
              key={item.href}
              component={Link}
              href={item.href}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 1.5,
                py: 1.25,
                borderRadius: 1.5,
                textDecoration: "none",
                fontFamily: "var(--font-roboto), sans-serif",
                fontSize: "0.875rem",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "primary.light" : "text.secondary",
                bgcolor: isActive ? "rgba(138,92,246,0.12)" : "transparent",
                border: "1px solid",
                borderColor: isActive ? "rgba(138,92,246,0.25)" : "transparent",
                transition: "all 0.15s",
                "&:hover": {
                  bgcolor: isActive ? "rgba(138,92,246,0.15)" : "rgba(255,255,255,0.04)",
                  color: isActive ? "primary.light" : "text.primary",
                },
              }}
            >
              <Box sx={{ color: isActive ? "primary.main" : "text.secondary", display: "flex" }}>
                {item.icon}
              </Box>
              {item.label}
            </Box>
          );
        })}
      </Box>

      {/* Settings at bottom */}
      <Box
        component={Link}
        href="/settings"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 1.5,
          py: 1.25,
          borderRadius: 1.5,
          textDecoration: "none",
          fontFamily: "var(--font-roboto), sans-serif",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "text.secondary",
          borderTop: "1px solid",
          borderColor: "divider",
          pt: 2,
          mt: 1,
          transition: "all 0.15s",
          "&:hover": {
            color: "text.primary",
          },
        }}
      >
        <SettingsOutlinedIcon fontSize="small" />
        Settings
      </Box>
    </Box>
  );
}
