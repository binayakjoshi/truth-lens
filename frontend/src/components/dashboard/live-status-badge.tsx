"use client";

import { useEffect, useState } from "react";

import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";

export interface ServiceStatus {
  name: string;
  status: "online" | "degraded" | "offline";
}

const POLL_INTERVAL_MS = 20000;

const STATUS_COLOR: Record<ServiceStatus["status"], "success" | "warning" | "error"> = {
  online: "success",
  degraded: "warning",
  offline: "error",
};

export default function LiveStatusBadge({
  initialServices,
}: {
  initialServices: ServiceStatus[];
}) {
  const [services, setServices] = useState(initialServices);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (res.ok) {
          const body = await res.json();
          if (!cancelled && Array.isArray(body.services)) {
            setServices(body.services);
          }
        }
      } catch {
        // Keep showing the last known status if the health check fails.
      } finally {
        if (!cancelled) setLastChecked(new Date());
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const allOnline = services.every((s) => s.status === "online");

  return (
    <Tooltip
      title={
        <Stack spacing={0.5} sx={{ py: 0.5 }}>
          {services.map((s) => (
            <Typography key={s.name} variant="caption" sx={{ display: "block" }}>
              {s.name}: {s.status}
            </Typography>
          ))}
          {lastChecked && (
            <Typography variant="caption" sx={{ display: "block", opacity: 0.7 }}>
              Checked {lastChecked.toLocaleTimeString()}
            </Typography>
          )}
        </Stack>
      }
    >
      <Chip
        icon={
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: `${STATUS_COLOR[allOnline ? "online" : "degraded"]}.main`,
              animation: allOnline ? "dashboard-pulse 2s ease-in-out infinite" : "none",
              "@keyframes dashboard-pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.35 },
              },
            }}
          />
        }
        label={allOnline ? "All systems operational" : "Degraded performance"}
        variant="outlined"
        sx={{
          borderColor: "divider",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.75rem",
          "& .MuiChip-icon": { ml: 1.25, mr: -0.5 },
        }}
      />
    </Tooltip>
  );
}
