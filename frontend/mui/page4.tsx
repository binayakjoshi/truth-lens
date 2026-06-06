"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import SideNav from "@/components/layout/SideNav";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const historyRows = [
  { id: "TR-842-X", title: "Deepfake detection #842", date: "Oct 24, 2024", result: "AI Generated" as const, confidence: 98.5, time: "1.2s", thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuADpbMAIk2H-0Fd6RLUyohhPjBXq3qH3Ipk0kA6yYIYfiw5-P7ZDZI6Z40Ma5udYNnTO5M6HkPXDhs_RSdv0gY9JfkMHiBA9oE-eYtmOBR8RS55pUfoyWarp2ACSSGRfuGg2VOwynKEg6deDbYP3z3Cc5WccsHDJKYECtXAcn_xtfi_wCNLaXngzne2QZBX6wPPSf2Fe5ZZ-Gs3Br9angoLlJXia1eFanJ65vVTJq1UxErmI9XXgWf8G9qeKKpdeXTlzTH5Ed4X0JI" },
  { id: "TR-841-A", title: "Corporate Headshot #12", date: "Oct 23, 2024", result: "Authentic" as const, confidence: 99.9, time: "0.8s", thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuDoeZMgPf0TgBhHmYjPfpdF5vtvCE0o_muCSp2dWhKl_sUbaXynObGGUBGtOnDbEP6Fj_omxGBaD5E6e-cT1tfLTRZdNhWQGDzpYA0jZLg2zzWmGzJqBb8mibueRqDbYdPKc8mbPxY8-PGz-Y4buoHZSxyGquXy6m2kSs3G1NQ-8Xy9G1QzlC3nAd_Y4cs2atjXXZXF9shWVTnhmlBuPPFKyEBQK5z4p0rucVfcz5OfXJ4e205_oG9xjHbQQSadQtMGuqsXuBnnUGs" },
  { id: "TR-840-X", title: "Campaign Asset - Alpha", date: "Oct 22, 2024", result: "AI Generated" as const, confidence: 74.2, time: "2.1s", thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWbusVk8ifz1kHK6icHCrH3J-HdFPY5SFykMDNwjjp133pB4mCclgKp_Y1le7p6JMX4tay_yxTd3Go5vCwhf-tC2ExiWPEENnP4ntO4kONZz8PhrYAQlLxgQTAz8WOBDzYOWFfqUoFHzXFNqNnqBaeM2Y2kNRMn-E6D9m1qBCWnFNlpISaXql64cJrf-rYxK0dOxhQ0zitvg5AiiN7QBxibN7PO9o-M3gmlCyR0_QyLnUMs_A0Up1NneIYr8vAcN_OyZ-viiIw2Y" },
  { id: "TR-839-A", title: "ID Verification Scan #991", date: "Oct 21, 2024", result: "Authentic" as const, confidence: 95.0, time: "1.5s", thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgKz4OFyxWvidmSLzuoE3katSA7RCfADqSgb5BynqSWPHbZdxPc8A-mAHfXuNM0GOw_9cVS3Oh2Kyk5nWO9kiIFPaWiR3YFoCkuqjG_B3YK01E23KKrK0wnji8ftGlocVrOSCLJo6sKGcQ5JAlhoKIPCt_UGpC3-oVfIgQKJWUwryzxHNwmtO3GuhEe_L5AsM1EaplsmNBP2ZOltBKI7jt8AISZq2K4mInW5BRDXFCa0giIZQ_kfmVIucDl5xof44Q1VDRe0z8_9U" },
  { id: "TR-838-X", title: "Video Frame - News Clip", date: "Oct 20, 2024", result: "AI Generated" as const, confidence: 88.3, time: "4.5s", thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjTdnK7yidxU4dLCInQ1r3-kIyiiL2vnfI-W-fEeaEuhRL890nQmTRAKsKQf_qvtyup7qjS8dDzAfxavUCCdK9bs26LqGoKnzCS6QcdzG_zi6QGC-rqjkpG35OtMmklUsxXe1ybKlpx-IbFfeJRTDc1zu61dz68NrP3UsnSALa7O6huU67_YI7eeQ4ZJ_oSk-cHEac3MiSx86gP5Wk5-3Efv5UM9RiGzpurnjSlmyvoSJFMIaoUdeoJs4dGx6OTK5zSRpQDE_pVrc" },
];

function ResultChip({ result }: { result: "AI Generated" | "Authentic" }) {
  const isAI = result === "AI Generated";
  return (
    <Chip
      icon={isAI ? <WarningAmberIcon sx={{ fontSize: "14px !important" }} /> : <VerifiedOutlinedIcon sx={{ fontSize: "14px !important" }} />}
      label={result}
      size="small"
      sx={{
        bgcolor: isAI ? "rgba(248,113,113,0.1)" : "rgba(52,211,153,0.1)",
        color: isAI ? "#f87171" : "#34d399",
        border: "1px solid",
        borderColor: isAI ? "rgba(248,113,113,0.2)" : "rgba(52,211,153,0.2)",
        fontSize: "0.7rem",
        fontFamily: "var(--font-roboto), sans-serif",
        "& .MuiChip-icon": { color: "inherit" },
      }}
    />
  );
}

export default function HistoryPage() {
  return (
    <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh" }}>
      <SideNav />

      {/* Top Bar */}
      <Box
        component="header"
        sx={{
          position: "fixed",
          top: 0,
          left: 256,
          right: 0,
          height: 64,
          bgcolor: "rgba(12,12,14,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 6,
          zIndex: 30,
        }}
      >
        <OutlinedInput
          placeholder="Search analysis history, IDs, or tags..."
          size="small"
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </InputAdornment>
          }
          sx={{
            maxWidth: 420,
            width: "100%",
            fontSize: "0.875rem",
            fontFamily: "var(--font-roboto), sans-serif",
            color: "text.primary",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(138,92,246,0.4)" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton size="small" sx={{ color: "text.secondary", position: "relative" }}>
            <NotificationsOutlinedIcon fontSize="small" />
            <Box sx={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, bgcolor: "error.main", borderRadius: "50%", border: "1.5px solid", borderColor: "background.default" }} />
          </IconButton>
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <AccountCircleOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{ ml: "256px", flex: 1, pt: "64px", px: { xs: 2, md: 6 }, pb: 6, minHeight: "100vh" }}
      >
        <Box sx={{ maxWidth: 1280, mx: "auto", pt: 4 }}>

          {/* Page Header */}
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { md: "flex-end" }, gap: 2, mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontFamily: "var(--font-playfair), serif", fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                Analysis History
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Review and manage past forensic detections.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              {[
                { options: ["All Results", "AI Generated", "Authentic"] },
                { options: ["Last 30 Days", "Last 7 Days", "All Time"] },
              ].map((filter, i) => (
                <Select
                  key={i}
                  defaultValue={filter.options[0]}
                  size="small"
                  sx={{
                    fontSize: "0.8rem",
                    fontFamily: "var(--font-roboto), sans-serif",
                    color: "text.primary",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(138,92,246,0.4)" },
                    "& .MuiSelect-icon": { color: "text.secondary" },
                    bgcolor: "background.paper",
                  }}
                >
                  {filter.options.map((o) => (
                    <MenuItem key={o} value={o} sx={{ fontSize: "0.8rem" }}>{o}</MenuItem>
                  ))}
                </Select>
              ))}
            </Box>
          </Box>

          {/* Table */}
          <Box sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
            {/* Table Header */}
            <Box
              sx={{
                display: { xs: "none", md: "grid" },
                gridTemplateColumns: "auto 1fr 120px 160px 100px 100px",
                gap: 3,
                alignItems: "center",
                px: 3,
                py: 2,
                bgcolor: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ width: 64 }} />
              {["Analysis Details", "Date", "Result", "Confidence", "Actions"].map((h) => (
                <Typography key={h} variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.65rem", fontWeight: 600, textAlign: h === "Confidence" || h === "Actions" ? "right" : "left" }}>
                  {h}
                </Typography>
              ))}
            </Box>

            {/* Rows */}
            <Box sx={{ display: "flex", flexDirection: "column", "& > *:not(:last-child)": { borderBottom: "1px solid", borderColor: "divider" } }}>
              {historyRows.map((row) => {
                const isAI = row.result === "AI Generated";
                return (
                  <Box
                    key={row.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "auto 1fr 120px 160px 100px 100px" },
                      gap: { xs: 1, md: 3 },
                      alignItems: "center",
                      px: 3,
                      py: 2,
                      transition: "background 0.15s",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
                      "&:hover .row-actions": { opacity: 1 },
                    }}
                  >
                    {/* Thumbnail */}
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 1.5,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "divider",
                        display: { xs: "none", md: "block" },
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        component="img"
                        src={row.thumb}
                        alt={row.title}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>

                    {/* Details */}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row.title}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary" }}>{row.id}</Typography>
                        <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "divider" }} />
                        <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary" }}>{row.time}</Typography>
                      </Box>
                    </Box>

                    {/* Date */}
                    <Typography sx={{ fontFamily: "monospace", fontSize: "0.75rem", color: "text.secondary" }}>
                      {row.date}
                    </Typography>

                    {/* Result */}
                    <ResultChip result={row.result} />

                    {/* Confidence */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <Typography sx={{ fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 600, color: "text.primary" }}>
                        {row.confidence}%
                      </Typography>
                      <Box sx={{ width: "100%", height: 4, bgcolor: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", mt: 0.5 }}>
                        <Box
                          sx={{
                            height: "100%",
                            width: `${row.confidence}%`,
                            bgcolor: isAI ? "error.main" : "#34d399",
                            borderRadius: 2,
                            opacity: isAI && row.confidence < 90 ? 0.7 : 1,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box className="row-actions" sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, opacity: { xs: 1, md: 0 }, transition: "opacity 0.15s" }}>
                      <IconButton size="small" sx={{ color: "text.secondary", "&:hover": { color: "primary.light" } }} title="View Details">
                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton size="small" sx={{ color: "text.secondary", "&:hover": { color: "primary.light" } }} title="Export Report">
                        <DownloadOutlinedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Pagination */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 3,
                py: 2,
                bgcolor: "rgba(255,255,255,0.02)",
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Showing 1 to 5 of 24 entries
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton size="small" disabled sx={{ color: "text.disabled" }}>
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: "text.secondary", "&:hover": { color: "primary.light" } }}>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}