import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import VerifiedIcon from "@mui/icons-material/Verified";

export type StatusColor = "error.main" | "success.main" | "warning.main";

export interface ClassifiableResult {
  classification: "real" | "fake" | "uncertain";
  realConfidence: number;
  fakeConfidence: number;
}

export interface StatusMeta {
  label: string;
  color: StatusColor;
  isUncertain: boolean;
  confidencePercent: number;
  realPercent: number;
  fakePercent: number;
  Icon: typeof SmartToyIcon;
}

export function getStatusMeta(item: ClassifiableResult): StatusMeta {
  const { classification, realConfidence, fakeConfidence } = item;
  const realPercent = Math.round(realConfidence * 1000) / 10;
  const fakePercent = Math.round(fakeConfidence * 1000) / 10;

  if (classification === "fake") {
    return {
      label: "AI Generated",
      color: "error.main",
      isUncertain: false,
      confidencePercent: fakePercent,
      realPercent,
      fakePercent,
      Icon: SmartToyIcon,
    };
  }

  if (classification === "uncertain") {
    return {
      label: "Uncertain",
      color: "warning.main",
      isUncertain: true,
      confidencePercent: Math.max(realPercent, fakePercent),
      realPercent,
      fakePercent,
      Icon: HelpOutlineIcon,
    };
  }

  return {
    label: "Authentic",
    color: "success.main",
    isUncertain: false,
    confidencePercent: realPercent,
    realPercent,
    fakePercent,
    Icon: VerifiedIcon,
  };
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
