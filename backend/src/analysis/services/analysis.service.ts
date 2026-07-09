import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createResponse } from 'src/common/utils/response-handler';
import { Repository } from 'typeorm';

import { SearchHistoryDto } from '../dtos/search-history.dto';
import { AnalysisHistory } from '../entities/analysis-history.entity';
import { AnonymousUsage } from '../entities/anonymous-usage.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ClassificationResult } from 'src/common/enum';
import { ModelResponse, PredictErrorResponse } from 'src/common/type';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(AnonymousUsage)
    private readonly anonymousUsageRepo: Repository<AnonymousUsage>,
    @InjectRepository(AnalysisHistory)
    private readonly analysisHistoryRepo: Repository<AnalysisHistory>,
  ) {}

  async getAnalysisHistories(userId: string, dto: SearchHistoryDto) {
    const { page = '1', limit = '10', sort = 'DESC' } = dto;

    const [analysisHistories, total] =
      await this.analysisHistoryRepo.findAndCount({
        where: { userId },
        order: { createdAt: sort },
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
      });

    return createResponse(HttpStatus.OK, 'user analysis fetched sucessfully', {
      analysisHistories,
      total,
      page: Number(page),
      limit: Number(limit),
      lastPage: Math.ceil(total / Number(limit)),
    });
  }

  async getSingleAnalysisHistory(userId: string, id: string) {
    const analysis = await this.analysisHistoryRepo.findOne({
      where: {
        userId,
        id,
      },
    });

    if (!analysis)
      throw new NotFoundException('Could not find analysis history.');
    return createResponse(
      HttpStatus.OK,
      'Analyis history fetched sucessfully',
      analysis,
    );
  }

  async increment(identifier: string): Promise<number> {
    const today = new Date().toISOString().slice(0, 10);

    let usage = await this.anonymousUsageRepo.findOne({
      where: {
        identifier,
        usageDate: today,
      },
    });

    if (!usage) {
      usage = this.anonymousUsageRepo.create({
        identifier,
        usageDate: today,
        requestCount: 1,
      });
    } else {
      usage.requestCount += 1;
    }

    await this.anonymousUsageRepo.save(usage);

    return usage.requestCount;
  }

  async analyzeAndSave(file: Express.Multer.File, userId: string) {
    const predictResult = await this.callPredictApi(file);
    const { prediction, confidenceScores, heatmapBase64 } = predictResult.data;

    const UPLOAD_ROOT = path.join(
      process.cwd(),
      'uploads',
      'analysis-histories',
    );
    const id = uuidv4();
    const dir = path.join(UPLOAD_ROOT, id);
    await fs.mkdir(dir, { recursive: true });

    const originalPath = path.join(dir, 'original.png');
    const overlayPath = path.join(dir, 'overlay.png');

    await fs.writeFile(originalPath, file.buffer);
    await fs.writeFile(overlayPath, this.base64ToBuffer(heatmapBase64));

    const originalImageUrl = `uploads/analysis-histories/${id}/original.png`;
    const heatmapImageUrl = `uploads/analysis-histories/${id}/overlay.png`;

    const classification =
      prediction === 'Real'
        ? ClassificationResult.REAL
        : ClassificationResult.FAKE;

    const confidence =
      prediction === 'Real'
        ? confidenceScores.real
        : confidenceScores.aiGenerated;

    const record = this.analysisHistoryRepo.create({
      id,
      userId,
      classification,
      confidence,
      originalImageUrl,
      heatmapImageUrl,
    });

    await this.analysisHistoryRepo.save(record);

    return createResponse(HttpStatus.OK, 'prediction', record);
  }
  private async callPredictApi(
    file: Express.Multer.File,
  ): Promise<ModelResponse> {
    const form = new FormData();
    const blob = new Blob([new Uint8Array(file.buffer)], {
      type: file.mimetype,
    });
    form.append('file', blob, file.originalname);

    let response: Response;
    try {
      response = await fetch(
        process.env.PREDICT_API_URL || 'http://ml-model:8000/api/v1/predict',
        {
          method: 'POST',
          body: form,
        },
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Failed to reach prediction service',
      );
    }

    if (!response.ok) {
      const errorBody = (await response
        .json()
        .catch(() => null)) as PredictErrorResponse | null;
      throw new BadRequestException(
        errorBody?.detail ?? 'Prediction service error',
      );
    }

    return response.json() as Promise<ModelResponse>;
  }

  private base64ToBuffer(dataUrl: string): Buffer {
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }
}
