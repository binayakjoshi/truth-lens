import { AnalysisHistory } from "@/types/type";

export interface DashboardStats {
  totalScans: number;
  manipulatedCount: number;
  authenticCount: number;
  uncertainCount: number;
  avgConfidence: number;
}

interface PaginatedAnalysisResponse {
  data: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
    analysisHistories: AnalysisHistory[];
  };
}

export async function getDashboardStats(
  cookieHeader: string,
): Promise<DashboardStats | null> {
  try {
    const res = await fetch(
      `${process.env.PROXY_API_URL}/api/dashboard/stats`,
      { headers: { Cookie: cookieHeader }, cache: "no-store" },
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
): Promise<AnalysisHistory[]> {
  try {
    const res = await fetch(
      `${process.env.PROXY_API_URL}/api/analysis?limit=${limit}`,
      { headers: { Cookie: cookieHeader }, cache: "no-store" },
    );
    if (!res.ok) return [];
    const body: PaginatedAnalysisResponse = await res.json();
    return Array.isArray(body?.data?.analysisHistories)
      ? body.data.analysisHistories
      : [];
  } catch {
    return [];
  }
}
