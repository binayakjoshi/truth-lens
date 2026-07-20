export type Verdict = "authentic" | "uncertain" | "manipulated";

export interface DashboardStats {
  totalScans: number;
  manipulatedCount: number;
  authenticCount: number;
  uncertainCount: number;
  avgConfidence: number;
}

export interface CaseRecord {
  id: string;
  filename: string;
  verdict: Verdict;
  /** 0-100 likelihood the media is manipulated */
  confidence: number;
  createdAt: string;
}

/**
 * These fetchers assume a backend contract of:
 *   GET /api/dashboard/stats          -> { data: DashboardStats }
 *   GET /api/dashboard/recent-cases   -> { data: CaseRecord[] }
 *
 * Adjust the paths and response shape below to match your actual API —
 * both fail closed (return null / []) so the page never crashes if the
 * endpoint isn't ready yet.
 */

export async function getDashboardStats(
  cookieHeader: string,
): Promise<DashboardStats | null> {
  try {
    const res = await fetch(
      `${process.env.PROXY_API_URL}/api/dashboard/stats`,
      {
        headers: { Cookie: cookieHeader },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const body = await res.json();
    return body.data as DashboardStats;
  } catch {
    return null;
  }
}

export async function getRecentCases(
  cookieHeader: string,
  limit = 6,
): Promise<CaseRecord[]> {
  try {
    const res = await fetch(
      `${process.env.PROXY_API_URL}/api/dashboard/recent-cases?limit=${limit}`,
      {
        headers: { Cookie: cookieHeader },
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body.data) ? (body.data as CaseRecord[]) : [];
  } catch {
    return [];
  }
}

export function verdictFromConfidence(confidence: number): Verdict {
  if (confidence < 30) return "authentic";
  if (confidence < 70) return "uncertain";
  return "manipulated";
}
