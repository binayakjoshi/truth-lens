export type AnalysisHistory = {
  id: string;
  classification: "real" | "fake" | "uncertain";
  userId: string;
  realConfidence: number;
  fakeConfidence: number;
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

export interface BulkResult {
  id: string;
  classification: "real" | "fake" | "uncertain";
  userId?: string;
  realConfidence: number;
  fakeConfidence: number;
  originalImageUrl: string;
  heatmapImageUrl: string;
  createdAt: string;
}

export interface BulkFailure {
  index: number;
  message: string;
}

export interface BulkData {
  total: number;
  succeeded: number;
  failed: number;
  results: BulkResult[];
  failures: BulkFailure[];
}

export interface AnalysisResult {
  id: string;
  classification: "real" | "fake" | "uncertain";
  userId?: string;
  realConfidence: number;
  fakeConfidence: number;
  originalImageUrl: string;
  heatmapImageUrl: string;
  createdAt: string;
}
