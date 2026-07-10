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
    prediction: 'AI-Generated' | 'Real';
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
