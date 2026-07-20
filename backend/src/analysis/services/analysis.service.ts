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
import {
  BulkModelResponse,
  ModelResponse,
  PredictErrorResponse,
} from 'src/common/type';
import { createResponse } from 'src/common/utils/response-handler';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { SearchHistoryDto } from '../dtos/search-history.dto';
import { AnalysisHistory } from '../entities/analysis-history.entity';

@Injectable()
export class AnalysisService {
  private readonly MAX_BULK_FILES = 15;
  constructor(
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

  private resolveClassification(
    prediction: string,
    confidenceScores: { real: number; aiGenerated: number; uncertain?: number },
  ): {
    classification: ClassificationResult;
    realConfidence: number;
    fakeConfidence: number;
  } {
    switch (prediction) {
      case 'Real':
        return {
          classification: ClassificationResult.REAL,
          realConfidence: confidenceScores.real,
          fakeConfidence: confidenceScores.aiGenerated,
        };
      case 'AI-Generated':
        return {
          classification: ClassificationResult.FAKE,
          realConfidence: confidenceScores.real,
          fakeConfidence: confidenceScores.aiGenerated,
        };
      case 'Uncertain':
        return {
          classification: ClassificationResult.UNCERTAIN,
          realConfidence: confidenceScores.real,
          fakeConfidence: confidenceScores.aiGenerated,
        };
      default:
        throw new BadRequestException(
          `Unexpected prediction value: ${prediction}`,
        );
    }
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

    const { classification, realConfidence, fakeConfidence } =
      this.resolveClassification(prediction, confidenceScores);

    const record = this.analysisHistoryRepo.create({
      id,
      userId,
      classification,
      realConfidence,
      fakeConfidence,
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

    const { classification, realConfidence, fakeConfidence } =
      this.resolveClassification(prediction, confidenceScores);

    const result = {
      id,
      classification,
      realConfidence,
      fakeConfidence,
      originalImageUrl,
      heatmapImageUrl,
    };
    return createResponse(HttpStatus.OK, 'prediction', result);
  }

  async bulkAnalyzeAndSave(files: Express.Multer.File[], userId: string) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }
    if (files.length > this.MAX_BULK_FILES) {
      throw new BadRequestException(
        `A maximum of ${this.MAX_BULK_FILES} files can be uploaded at once`,
      );
    }

    const modelResponse = await this.callBulkPredictApi(files);

    const UPLOAD_ROOT = path.join(
      process.cwd(),
      'uploads',
      'analysis-histories',
    );

    const records: AnalysisHistory[] = [];
    const failures: { index: number; message: string }[] = [];

    for (const item of modelResponse.results) {
      const sourceFile = files[item.index];

      if (!item.success || !sourceFile) {
        failures.push({
          index: item.index,
          message: item.message ?? 'Prediction failed for this file',
        });
        continue;
      }

      const id = uuidv4();
      const dir = path.join(UPLOAD_ROOT, id);
      await fs.mkdir(dir, { recursive: true });

      const originalPath = path.join(dir, 'original.png');
      const overlayPath = path.join(dir, 'overlay.png');

      await fs.writeFile(originalPath, sourceFile.buffer);
      if (item.heatmapBase64) {
        await fs.writeFile(
          overlayPath,
          this.base64ToBuffer(item.heatmapBase64),
        );
      }

      const originalImageUrl = `uploads/analysis-histories/${id}/original.png`;
      const heatmapImageUrl = `uploads/analysis-histories/${id}/overlay.png`;

      let classification: ClassificationResult;
      let realConfidence: number | undefined;
      let fakeConfidence: number | undefined;

      try {
        ({ classification, realConfidence, fakeConfidence } =
          this.resolveClassification(
            item.prediction,
            item.confidenceScores ?? { real: 0, aiGenerated: 0 },
          ));
      } catch {
        failures.push({
          index: item.index,
          message: `Unexpected prediction value: ${item.prediction}`,
        });
        continue;
      }

      const record = this.analysisHistoryRepo.create({
        userId,
        classification,
        realConfidence,
        fakeConfidence,
        originalImageUrl,
        heatmapImageUrl,
      });

      records.push(record);
    }

    const savedRecords = records.length
      ? await this.analysisHistoryRepo.save(records)
      : [];

    return createResponse(HttpStatus.OK, 'bulk prediction', {
      total: modelResponse.total,
      succeeded: savedRecords.length,
      failed: modelResponse.total - savedRecords.length,
      results: savedRecords,
      failures,
    });
  }

  private async callBulkPredictApi(
    files: Express.Multer.File[],
  ): Promise<BulkModelResponse> {
    const form = new FormData();
    files.forEach((file) => {
      const blob = new Blob([new Uint8Array(file.buffer)], {
        type: file.mimetype,
      });
      form.append('files', blob, file.originalname);
    });

    let response: Response;
    try {
      response = await fetch(
        `${process.env.ML_MODEL_API_URL}/api/v1/bulk-upload`,
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
      | BulkModelResponse
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

    return body as BulkModelResponse;
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
      response = await fetch(`${process.env.ML_MODEL_API_URL}/api/v1/predict`, {
        method: 'POST',
        body: form,
      });
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
