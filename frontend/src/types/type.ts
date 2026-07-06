export type AnalysisHistory = {
  id: string;
  classification: "real" | "fake";
  userId: string;
  confidence: number;
  originalImageUrl: string;
  heatmapImageUrl: string;
  createdAt: string;
};
export interface AnalysisHistoryResponse {
  analysisHistories: AnalysisHistory[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export type User = {
  id: string;
  email: string;
  username: string;
};
