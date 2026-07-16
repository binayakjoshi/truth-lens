import * as fs from 'fs/promises';
import * as path from 'path';

import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassificationResult } from 'src/common/enum';
import { ModelResponse, PredictErrorResponse } from 'src/common/type';
import { createResponse } from 'src/common/utils/response-handler';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { SearchHistoryDto } from '../dtos/search-history.dto';
import { AnalysisHistory } from '../entities/analysis-history.entity';
import { RedisService } from 'src/redis/services/redis.service';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(AnalysisHistory)
    private readonly analysisHistoryRepo: Repository<AnalysisHistory>,
    private readonly redisService: RedisService,
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

  async incrementMany(keys: string[]): Promise<number[]> {
    const client = this.redisService.getClient();
    const dateSuffix = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const fullKeys = keys.map((k) => `usage:${k}:${dateSuffix}`);

    const pipeline = client.pipeline();
    fullKeys.forEach((k) => pipeline.incr(k));
    const results = await pipeline.exec();

    if (!results) {
      throw new Error('Redis pipeline execution failed: no results returned');
    }
    const counts = results.map(([err, val]) => {
      if (err) throw err;
      return val as number;
    });

    const secondsUntilMidnight = this.getSecondsUntilMidnight();
    const ttlPipeline = client.pipeline();
    let needsExpire = false;

    fullKeys.forEach((k, i) => {
      if (counts[i] === 1) {
        ttlPipeline.expire(k, secondsUntilMidnight);
        needsExpire = true;
      }
    });

    if (needsExpire) {
      await ttlPipeline.exec();
    }

    return counts;
  }

  private getSecondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
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

  async analyzeWithoutSave(file: Express.Multer.File) {
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

    const result = {
      id,
      classification,
      confidence,
      originalImageUrl,
      heatmapImageUrl,
    };

    return createResponse(HttpStatus.OK, 'prediction', result);
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

    const body = (await response.json().catch(() => null)) as
      | ModelResponse
      | PredictErrorResponse
      | null;
    if (!response.ok || !body || body.success === false) {
      const message =
        (body as PredictErrorResponse | null)?.message ??
        'Prediction service error';

      switch (response.status) {
        case 422:
          throw new UnprocessableEntityException(message);
        case 400:
          throw new BadRequestException(message);
        default:
          throw new InternalServerErrorException(message);
      }
    }

    return body;
  }

  private base64ToBuffer(dataUrl: string): Buffer {
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }
}
