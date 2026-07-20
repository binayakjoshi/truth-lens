import type { Request } from 'express';
export class ExtendedRequest extends Request {
  user: {
    id: string;
  };
}

export interface ModelResponse {
  success: boolean;
  message: string;
  status: number;
  data: {
    prediction: 'AI-Generated' | 'Real' | 'Uncertain';
    confidenceScores: {
      real: number;
      aiGenerated: number;
    };
    heatmapBase64: string;
  };
}

export interface PredictErrorResponse {
  success: false;
  message: string;
  status: number;
  data: null;
}
export interface BulkBoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface BulkModelResultItem {
  index: number;
  success: boolean;
  message: string | null;
  prediction: 'Real' | 'AI-Generated' | 'Uncertain';
  confidenceScores: {
    real: number;
    aiGenerated: number;
  } | null;
  boundingBox: BulkBoundingBox | null;
  heatmapBase64: string | null;
  originalImageBase64?: string | null;
}

export interface BulkModelResponse {
  success: boolean;
  message: string;
  status: number;
  total: number;
  succeeded: number;
  failed: number;
  results: BulkModelResultItem[];
}
