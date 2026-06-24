import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AnonymousUsage } from '../entities/anonymous-usage.entity';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(AnonymousUsage)
    private readonly repo: Repository<AnonymousUsage>,
  ) {}

  async increment(identifier: string): Promise<number> {
    const today = new Date().toISOString().slice(0, 10);

    let usage = await this.repo.findOne({
      where: {
        identifier,
        usageDate: today,
      },
    });

    if (!usage) {
      usage = this.repo.create({
        identifier,
        usageDate: today,
        requestCount: 1,
      });
    } else {
      usage.requestCount += 1;
    }

    await this.repo.save(usage);

    return usage.requestCount;
  }
}
