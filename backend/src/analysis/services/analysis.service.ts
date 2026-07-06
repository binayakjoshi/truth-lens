import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createResponse } from 'src/common/utils/response-handler';
import { Repository } from 'typeorm';

import { SearchHistoryDto } from '../dtos/search-history.dto';
import { AnalysisHistory } from '../entities/analysis-history.entity';
import { AnonymousUsage } from '../entities/anonymous-usage.entity';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(AnonymousUsage)
    private readonly anonymousUsageRepo: Repository<AnonymousUsage>,
    @InjectRepository(AnalysisHistory)
    private readonly analysisHistoryRepo: Repository<AnalysisHistory>,
  ) {}

  async getAnalysisHistories(userId: string, dto: SearchHistoryDto) {
    const { page = '1', limit = '15', sort = 'DESC' } = dto;

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
}
