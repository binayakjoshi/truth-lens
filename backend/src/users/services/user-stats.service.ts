import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createResponse } from 'src/common/utils/response-handler';
import { Repository, EntityManager } from 'typeorm';

import { UserStat } from '../entities/user-stats.entity';

type Classification = 'real' | 'fake' | 'uncertain';

interface AnalysisRecordForStats {
  classification: Classification;
  fakeConfidence: number;
}

@Injectable()
export class UserStatsService {
  constructor(
    @InjectRepository(UserStat)
    private readonly userStatRepo: Repository<UserStat>,
  ) {}

  async getUserStat(userId: string) {
    const userStat = await this.userStatRepo.findOne({
      where: {
        userId,
      },
    });
    if (!userStat)
      throw new NotFoundException('Coud not find stats for the current user');

    return createResponse(200, 'user stats retrieved sucessfully', userStat);
  }
  async createForUser(
    userId: string,
    manager?: EntityManager,
  ): Promise<UserStat> {
    const repo = manager ? manager.getRepository(UserStat) : this.userStatRepo;
    const stat = repo.create({
      user: { id: userId },
      totalCount: 0,
      fakeCount: 0,
      realCount: 0,
      uncertainCount: 0,
      avgManupulationScore: 0,
    });
    return repo.save(stat);
  }

  async incrementForAnalysis(
    userId: string,
    { classification, fakeConfidence }: AnalysisRecordForStats,
    manager?: EntityManager,
  ): Promise<void> {
    const fakeDelta = classification === 'fake' ? 1 : 0;
    const realDelta = classification === 'real' ? 1 : 0;
    const uncertainDelta = classification === 'uncertain' ? 1 : 0;
    await this.applyIncrement(
      userId,
      fakeDelta,
      realDelta,
      uncertainDelta,
      fakeConfidence,
      manager,
    );
  }

  async incrementForBulkAnalysis(
    userId: string,
    records: AnalysisRecordForStats[],
    manager?: EntityManager,
  ): Promise<void> {
    if (!records.length) return;

    const fakeCount = records.filter((r) => r.classification === 'fake').length;
    const realCount = records.filter((r) => r.classification === 'real').length;
    const uncertainCount = records.filter(
      (r) => r.classification === 'uncertain',
    ).length;
    const sumFakeConfidence = records.reduce(
      (sum, r) => sum + r.fakeConfidence,
      0,
    );

    const repo = manager ? manager.getRepository(UserStat) : this.userStatRepo;
    await repo
      .createQueryBuilder()
      .update(UserStat)
      .set({
        totalCount: () => `"totalCount" + ${records.length}`,
        fakeCount: () => `"fakeCount" + ${fakeCount}`,
        realCount: () => `"realCount" + ${realCount}`,
        uncertainCount: () => `"uncertainCount" + ${uncertainCount}`,
        avgManupulationScore: () =>
          `ROUND(((COALESCE("avgManupulationScore", 0) * "totalCount") + :sumFakeConfidence) / ("totalCount" + ${records.length}), 4)`,
      })
      .where('"userId" = :userId', { userId })
      .setParameter('sumFakeConfidence', sumFakeConfidence)
      .execute();
  }

  private async applyIncrement(
    userId: string,
    fakeDelta: number,
    realDelta: number,
    uncertainDelta: number,
    fakeConfidence: number,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(UserStat) : this.userStatRepo;
    await repo
      .createQueryBuilder()
      .update(UserStat)
      .set({
        totalCount: () => '"totalCount" + 1',
        fakeCount: () => `"fakeCount" + ${fakeDelta}`,
        realCount: () => `"realCount" + ${realDelta}`,
        uncertainCount: () => `"uncertainCount" + ${uncertainDelta}`,
        avgManupulationScore: () =>
          'ROUND(((COALESCE("avgManupulationScore", 0) * "totalCount") + :fakeConfidence) / ("totalCount" + 1), 4)',
      })
      .where('"userId" = :userId', { userId })
      .setParameter('fakeConfidence', fakeConfidence)
      .execute();
  }
}
