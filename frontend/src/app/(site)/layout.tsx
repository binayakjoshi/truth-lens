import React from "react";
import { Box } from "@mui/material";

import NavBar from "@/components/navigation/nav-bar";

type SiteLayoutProps = {
  children: React.ReactNode;
};

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <NavBar />

      <Box
        component="main"
        sx={{
          flex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
