import { Injectable } from '@nestjs/common';
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
    let userStat = await this.userStatRepo.findOne({
      where: {
        userId,
      },
    });
    if (!userStat) {
      userStat = await this.createBackfilledForUser(userId);
    }

    return createResponse(200, 'user stats retrieved sucessfully', userStat);
  }

  private async createBackfilledForUser(userId: string): Promise<UserStat> {
    const rows: UserStat[] = await this.userStatRepo.query(
      `
      INSERT INTO "userStats"
        ("id", "userId", "totalCount", "fakeCount", "realCount", "uncertainCount", "avgManupulationScore", "createdAt", "updatedAt")
      SELECT
        uuid_generate_v4(),
        a."userId",
        COUNT(*)::int,
        COUNT(*) FILTER (WHERE a.classification = 'fake')::int,
        COUNT(*) FILTER (WHERE a.classification = 'real')::int,
        COUNT(*) FILTER (WHERE a.classification = 'uncertain')::int,
        COALESCE(ROUND(AVG(a."fakeConfidence")::numeric, 4), 0),
        now(),
        now()
      FROM "analysisHistories" a
      WHERE a."userId" = $1
      GROUP BY a."userId"
      RETURNING *
      `,
      [userId],
    );

    if (rows.length) return rows[0];

    return this.createForUser(userId);
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

    const totalDelta = records.length;
    const fakeCount = records.filter((r) => r.classification === 'fake').length;
    const realCount = records.filter((r) => r.classification === 'real').length;
    const uncertainCount = records.filter(
      (r) => r.classification === 'uncertain',
    ).length;
    const sumFakeConfidence = records.reduce(
      (sum, r) => sum + r.fakeConfidence,
      0,
    );

    await this.applyUpsert(
      userId,
      totalDelta,
      fakeCount,
      realCount,
      uncertainCount,
      sumFakeConfidence,
      manager,
    );
  }

  private async applyIncrement(
    userId: string,
    fakeDelta: number,
    realDelta: number,
    uncertainDelta: number,
    fakeConfidence: number,
    manager?: EntityManager,
  ): Promise<void> {
    await this.applyUpsert(
      userId,
      1,
      fakeDelta,
      realDelta,
      uncertainDelta,
      fakeConfidence,
      manager,
    );
  }

  private async applyUpsert(
    userId: string,
    totalDelta: number,
    fakeDelta: number,
    realDelta: number,
    uncertainDelta: number,
    sumFakeConfidence: number,
    manager?: EntityManager,
  ): Promise<void> {
    const queryRunner = manager ? manager.queryRunner : undefined;
    const query = `
      INSERT INTO "userStats"
        ("userId", "totalCount", "fakeCount", "realCount", "uncertainCount", "avgManupulationScore", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, now(), now())
      ON CONFLICT ("userId") DO UPDATE SET
        "totalCount" = "userStats"."totalCount" + EXCLUDED."totalCount",
        "fakeCount" = "userStats"."fakeCount" + EXCLUDED."fakeCount",
        "realCount" = "userStats"."realCount" + EXCLUDED."realCount",
        "uncertainCount" = "userStats"."uncertainCount" + EXCLUDED."uncertainCount",
        "avgManupulationScore" = ROUND(
          ((COALESCE("userStats"."avgManupulationScore", 0) * "userStats"."totalCount") + EXCLUDED."avgManupulationScore") /
          ("userStats"."totalCount" + EXCLUDED."totalCount"),
          4
        ),
        "updatedAt" = now()
    `;

    const params = [
      userId,
      totalDelta,
      fakeDelta,
      realDelta,
      uncertainDelta,
      sumFakeConfidence,
    ];

    if (queryRunner) {
      await queryRunner.query(query, params);
    } else {
      await this.userStatRepo.query(query, params);
    }
  }
}
