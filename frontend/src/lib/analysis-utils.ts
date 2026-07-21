import { AnalysisHistory } from "@/types/type";

const ASSET_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_API_URL ?? "";

export function resolveAssetUrl(path?: string): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${ASSET_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

export function getManipulationScore(c: AnalysisHistory): number {
  const real = c.realConfidence ?? 0;
  const fake = c.fakeConfidence ?? 0;
  const fraction =
    c.classification === "real"
      ? real
      : c.classification === "fake"
        ? fake
        : Math.max(real, fake);
  return Math.round(fraction * 100);
}

export function getFilename(url?: string): string {
  if (!url) return "Untitled";
  try {
    const path = new URL(url).pathname;
    return path.split("/").pop() || url;
  } catch {
    return url.split("/").pop() || url;
  }
}

export function formatTimestamp(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
