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
import PDFDocument from 'pdfkit';
import { ClassificationResult } from 'src/common/enum';
import {
  BulkModelResponse,
  ModelResponse,
  PredictErrorResponse,
} from 'src/common/type';
import { createResponse } from 'src/common/utils/response-handler';
import { UserStatsService } from 'src/users/services/user-stats.service';
import { Between, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { ExportHistoryDto } from '../dtos/export-history.dto';
import { SearchHistoryDto } from '../dtos/search-history.dto';
import { AnalysisHistory } from '../entities/analysis-history.entity';

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'analysis-histories');

@Injectable()
export class AnalysisService {
  private readonly MAX_BULK_FILES = 15;

  constructor(
    @InjectRepository(AnalysisHistory)
    private readonly analysisHistoryRepo: Repository<AnalysisHistory>,
    private readonly userStatsService: UserStatsService,
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

  async getAnalysisHistoriesForExport(
    userId: string,
    dto: ExportHistoryDto,
  ): Promise<Buffer> {
    const { startDate, endDate } = dto;

    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required.');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format.');
    }

    if (start > end) {
      throw new BadRequestException('startDate cannot be after endDate.');
    }

    end.setHours(23, 59, 59, 999);

    const analysisHistories = await this.analysisHistoryRepo.find({
      where: {
        userId,
        createdAt: Between(start, end),
      },
      order: { createdAt: 'DESC' },
    });

    if (analysisHistories.length === 0) {
      throw new NotFoundException(
        'No analysis history found in the given date range.',
      );
    }

    if (analysisHistories.length > 500) {
      throw new BadRequestException(
        'Too many records in this range (max 500). Please narrow the date range.',
      );
    }

    const offsetMinutes = this.extractOffsetMinutes(startDate);

    return this.buildPdfReport(analysisHistories, start, end, offsetMinutes);
  }

  private extractOffsetMinutes(isoString: string): number | null {
    // Matches a trailing "+05:45" or "-08:00" style offset. Returns null for
    // "Z" (UTC) or strings with no offset at all.
    const match = isoString.match(/([+-])(\d{2}):(\d{2})$/);
    if (!match) return null;

    const sign = match[1] === '-' ? -1 : 1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);
    return sign * (hours * 60 + minutes);
  }

  private formatOffsetLabel(offsetMinutes: number | null): string {
    if (offsetMinutes === null) return 'UTC';
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMinutes);
    const hh = String(Math.floor(abs / 60)).padStart(2, '0');
    const mm = String(abs % 60).padStart(2, '0');
    return `UTC${sign}${hh}:${mm}`;
  }

  private shiftForOffset(date: Date, offsetMinutes: number | null): Date {
    return offsetMinutes === null
      ? date
      : new Date(date.getTime() + offsetMinutes * 60000);
  }

  private formatDateTime(date: Date, offsetMinutes: number | null): string {
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC', // date has already been manually shifted, so render as UTC
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(this.shiftForOffset(date, offsetMinutes));

    return `${formatted} (${this.formatOffsetLabel(offsetMinutes)})`;
  }

  private formatDateOnly(date: Date, offsetMinutes: number | null): string {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      dateStyle: 'medium',
    }).format(this.shiftForOffset(date, offsetMinutes));
  }

  private async readLocalImage(relativePath: string): Promise<Buffer | null> {
    if (!relativePath) return null;
    try {
      const fullPath = path.join(process.cwd(), relativePath);

      if (!fullPath.startsWith(UPLOAD_ROOT)) {
        return null;
      }

      return await fs.readFile(fullPath);
    } catch {
      return null;
    }
  }

  private async fetchAllImages(
    histories: AnalysisHistory[],
    concurrency = 8,
  ): Promise<Map<string, { original: Buffer | null; heatmap: Buffer | null }>> {
    const results = new Map<
      string,
      { original: Buffer | null; heatmap: Buffer | null }
    >();

    let cursor = 0;

    const worker = async () => {
      while (cursor < histories.length) {
        const item = histories[cursor++];

        const [original, heatmap] = await Promise.all([
          this.readLocalImage(item.originalImageUrl),
          this.readLocalImage(item.heatmapImageUrl),
        ]);

        results.set(item.id, { original, heatmap });
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(concurrency, histories.length) }, () =>
        worker(),
      ),
    );

    return results;
  }

  private async buildPdfReport(
    histories: AnalysisHistory[],
    start: Date,
    end: Date,
    offsetMinutes: number | null,
  ): Promise<Buffer> {
    const imageMap = await this.fetchAllImages(histories);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        bufferPages: true,
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const MARGIN = 40;
      const PAGE_WIDTH = doc.page.width;
      const PAGE_HEIGHT = doc.page.height;
      const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

      // ---- Theme tokens ----
      const COLORS = {
        primary: '#f59e0b',
        primaryLight: '#fbbf24',
        primaryDark: '#b45309',
        primaryContrast: '#1c1507',
        background: '#fdfaf4',
        surface: '#ffffff',
        surfaceAlt: '#faf6ec',
        textPrimary: '#1c1507',
        textSecondary: '#8a8172',
        textOnDark: '#fde8c2',
        border: '#ece3d1',
        track: '#f1e9d8',
        real: '#15803d',
        realBg: '#eafaf0',
        fake: '#dc2626',
        fakeBg: '#fdf0f0',
      };

      const realCount = histories.filter(
        (h) => !h.classification?.toLowerCase().includes('fake'),
      ).length;
      const fakeCount = histories.length - realCount;

      // ---- Header ----
      const HEADER_HEIGHT = 96;
      const STATS_HEIGHT = 40;

      const drawHeader = () => {
        const gradient = doc.linearGradient(0, 0, PAGE_WIDTH, 0);
        gradient.stop(0, COLORS.primaryDark).stop(1, COLORS.primary);
        doc.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT).fill(gradient);

        doc
          .fillColor(COLORS.surface)
          .fontSize(19)
          .font('Helvetica-Bold')
          .text('Analysis History Report', MARGIN, 26);

        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor(COLORS.textOnDark)
          .text(
            `${this.formatDateOnly(start, offsetMinutes)}  \u2192  ${this.formatDateOnly(end, offsetMinutes)}`,
            MARGIN,
            52,
          );

        const generatedLabel = `Generated ${this.formatDateTime(new Date(), offsetMinutes)}`;
        doc
          .fontSize(8)
          .fillColor(COLORS.textOnDark)
          .text(generatedLabel, MARGIN, PAGE_WIDTH ? 68 : 68);

        // Stats bar
        const statsY = HEADER_HEIGHT;
        doc.rect(0, statsY, PAGE_WIDTH, STATS_HEIGHT).fill(COLORS.surfaceAlt);
        doc
          .moveTo(0, statsY + STATS_HEIGHT)
          .lineTo(PAGE_WIDTH, statsY + STATS_HEIGHT)
          .strokeColor(COLORS.border)
          .lineWidth(1)
          .stroke();

        const drawStat = (
          x: number,
          label: string,
          value: string,
          color: string,
        ) => {
          doc
            .fontSize(13)
            .font('Helvetica-Bold')
            .fillColor(color)
            .text(value, x, statsY + 10, { continued: true })
            .fontSize(9)
            .font('Helvetica')
            .fillColor(COLORS.textSecondary)
            .text(`  ${label}`);
        };

        drawStat(
          MARGIN,
          'Total records',
          String(histories.length),
          COLORS.textPrimary,
        );
        drawStat(MARGIN + 160, 'Real', String(realCount), COLORS.real);
        drawStat(MARGIN + 260, 'Fake', String(fakeCount), COLORS.fake);

        doc.y = statsY + STATS_HEIGHT + 20;
        doc.fillColor(COLORS.textPrimary);
      };

      drawHeader();

      // ---- Helpers ----
      const drawConfidenceBar = (
        x: number,
        y: number,
        width: number,
        label: string,
        percentStr: string,
        color: string,
      ) => {
        doc
          .fontSize(8)
          .font('Helvetica-Bold')
          .fillColor(COLORS.textPrimary)
          .text(label, x, y, { continued: true })
          .font('Helvetica')
          .fillColor(COLORS.textSecondary)
          .text(`  ${percentStr}%`);

        const barY = y + 12;
        const barHeight = 6;
        doc
          .roundedRect(x, barY, width, barHeight, 3)
          .fillColor(COLORS.track)
          .fill();

        const pct = Math.max(0, Math.min(100, parseFloat(percentStr)));
        const fillWidth = pct <= 0 ? 0 : Math.max(6, (width * pct) / 100);
        if (fillWidth > 0) {
          doc
            .roundedRect(x, barY, fillWidth, barHeight, 3)
            .fillColor(color)
            .fill();
        }
      };

      const drawImage = (
        buf: Buffer | null,
        overlayBuf: Buffer | null,
        x: number,
        y: number,
        size: number,
        label: string,
      ) => {
        doc
          .roundedRect(x, y, size, size, 6)
          .fillColor(COLORS.surfaceAlt)
          .fill();

        if (buf) {
          try {
            doc.save();
            doc.roundedRect(x, y, size, size, 6).clip();
            doc.image(buf, x, y, { width: size, height: size });
            if (overlayBuf) {
              doc
                .opacity(0.55)
                .image(overlayBuf, x, y, { width: size, height: size })
                .opacity(1);
            }
            doc.restore();
          } catch {
            doc
              .fontSize(8)
              .fillColor(COLORS.fake)
              .text('Could not render.', x + 8, y + size / 2 - 4, {
                width: size - 16,
                align: 'center',
              });
          }
        } else {
          doc
            .fontSize(8)
            .fillColor(COLORS.textSecondary)
            .text('Unavailable.', x + 8, y + size / 2 - 4, {
              width: size - 16,
              align: 'center',
            });
        }

        doc
          .roundedRect(x, y, size, size, 6)
          .strokeColor(COLORS.border)
          .lineWidth(1)
          .stroke();

        doc
          .fontSize(8)
          .font('Helvetica-Bold')
          .fillColor(COLORS.textSecondary)
          .text(label, x, y + size + 6, { width: size, align: 'center' });
      };

      // ---- Cards ----
      const IMG_SIZE = 120;
      const IMG_GAP = 16;
      const CARD_PADDING = 14;
      const ACCENT_HEIGHT = 4;
      const CARD_HEIGHT =
        ACCENT_HEIGHT + CARD_PADDING * 2 + 20 + 34 + IMG_SIZE + 18;

      histories.forEach((item, index) => {
        if (doc.y + CARD_HEIGHT > PAGE_HEIGHT - MARGIN) {
          doc.addPage();
          doc.y = MARGIN;
        }

        const cardTop = doc.y;
        const cardLeft = MARGIN;
        const cardWidth = CONTENT_WIDTH;
        const isFake = item.classification?.toLowerCase().includes('fake');
        const accentColor = isFake ? COLORS.fake : COLORS.real;
        const badgeBg = isFake ? COLORS.fakeBg : COLORS.realBg;
        const badgeLabel = (item.classification ?? 'UNKNOWN').toUpperCase();

        // card background + border
        doc
          .roundedRect(cardLeft, cardTop, cardWidth, CARD_HEIGHT, 8)
          .fillColor(COLORS.surface)
          .fill();
        doc
          .roundedRect(cardLeft, cardTop, cardWidth, CARD_HEIGHT, 8)
          .strokeColor(COLORS.border)
          .lineWidth(1)
          .stroke();

        // top accent strip (clipped to rounded corners)
        doc.save();
        doc.roundedRect(cardLeft, cardTop, cardWidth, CARD_HEIGHT, 8).clip();
        doc.rect(cardLeft, cardTop, cardWidth, ACCENT_HEIGHT).fill(accentColor);
        doc.restore();

        const textX = cardLeft + CARD_PADDING;
        let cursorY = cardTop + ACCENT_HEIGHT + CARD_PADDING;

        // index circle
        const circleR = 9;
        doc
          .circle(textX + circleR, cursorY + circleR, circleR)
          .fillColor(COLORS.primaryLight)
          .fill();
        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .fillColor(COLORS.primaryContrast)
          .text(String(index + 1), textX, cursorY + circleR - 5, {
            width: circleR * 2,
            align: 'center',
          });

        // classification pill
        doc.fontSize(8).font('Helvetica-Bold');
        const badgeWidth = doc.widthOfString(badgeLabel) + 16;
        const badgeX = textX + circleR * 2 + 10;
        doc
          .roundedRect(badgeX, cursorY, badgeWidth, 18, 9)
          .fillColor(badgeBg)
          .fill();
        doc.fillColor(accentColor).text(badgeLabel, badgeX, cursorY + 5, {
          width: badgeWidth,
          align: 'center',
        });

        // ID + date, right aligned
        const dateLabel = this.formatDateTime(
          new Date(item.createdAt),
          offsetMinutes,
        );
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor(COLORS.textSecondary)
          .text(dateLabel, textX, cursorY + 1, {
            width: cardWidth - CARD_PADDING * 2,
            align: 'right',
          });
        doc
          .fontSize(7)
          .font('Courier')
          .fillColor(COLORS.textSecondary)
          .text(`ID: ${item.id}`, textX, cursorY + 12, {
            width: cardWidth - CARD_PADDING * 2,
            align: 'right',
          });

        cursorY += 30;

        // confidence bars
        const barsWidth = (cardWidth - CARD_PADDING * 2 - 24) / 2;
        const realPercent = (item.realConfidence * 100).toFixed(2);
        const fakePercent = (item.fakeConfidence * 100).toFixed(2);

        drawConfidenceBar(
          textX,
          cursorY,
          barsWidth,
          'Real',
          realPercent,
          COLORS.real,
        );
        drawConfidenceBar(
          textX + barsWidth + 24,
          cursorY,
          barsWidth,
          'Fake',
          fakePercent,
          COLORS.fake,
        );

        cursorY += 34;

        // images
        const imgs = imageMap.get(item.id);
        const originalX = textX;
        const overlayX = textX + IMG_SIZE + IMG_GAP;

        drawImage(
          imgs?.original ?? null,
          null,
          originalX,
          cursorY,
          IMG_SIZE,
          'Original',
        );
        drawImage(
          imgs?.original ?? null,
          imgs?.heatmap ?? null,
          overlayX,
          cursorY,
          IMG_SIZE,
          'Heatmap Overlay',
        );

        doc.y = cardTop + CARD_HEIGHT + 14;
        doc.fillColor(COLORS.textPrimary);
      });

      // ---- Footer ----
      const range = doc.bufferedPageRange();

      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);

        const originalBottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;

        doc
          .moveTo(MARGIN, PAGE_HEIGHT - 40)
          .lineTo(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 40)
          .strokeColor(COLORS.border)
          .lineWidth(1)
          .stroke();

        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor(COLORS.textSecondary)
          .text('Analysis History Report', MARGIN, PAGE_HEIGHT - 30, {
            continued: false,
          });

        doc
          .fontSize(8)
          .fillColor(COLORS.textSecondary)
          .text(`Page ${i + 1} of ${range.count}`, MARGIN, PAGE_HEIGHT - 30, {
            width: CONTENT_WIDTH,
            align: 'right',
          });

        doc.page.margins.bottom = originalBottomMargin;
      }

      doc.end();
    });
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

  async analyzeWithoutSave(file: Express.Multer.File) {
    const predictResult = await this.callPredictApi(file);

    const { prediction, confidenceScores, heatmapBase64 } = predictResult.data;

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

  async analyzeAndSave(file: Express.Multer.File, userId: string) {
    const predictResult = await this.callPredictApi(file);
    const { prediction, confidenceScores, heatmapBase64 } = predictResult.data;

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

    await this.userStatsService.incrementForAnalysis(userId, {
      classification,
      fakeConfidence,
    });
    return createResponse(HttpStatus.OK, 'prediction', record);
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
    if (savedRecords.length) {
      await this.userStatsService.incrementForBulkAnalysis(
        userId,
        savedRecords.map((r) => ({
          classification: r.classification,
          fakeConfidence: r.fakeConfidence,
        })),
      );
    }
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

    return body;
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
