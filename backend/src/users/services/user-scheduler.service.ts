import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OtpRecord } from '../entities/otp-record.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class UserCleanupService {
  private readonly logger = new Logger(UserCleanupService.name);

  constructor(
    @InjectRepository(OtpRecord)
    private readonly otpRecordRepo: Repository<OtpRecord>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOtpRecords() {
    const now = new Date();

    const { affected: usedDeleted } = await this.otpRecordRepo.delete({
      isUsed: true,
    });

    const { affected: expiredDeleted } = await this.otpRecordRepo
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now })
      .execute();

    this.logger.log(
      `OTP cleanup — used: ${usedDeleted}, expired unused: ${expiredDeleted}`,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async markUnverifiedUsersAsDeleted() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const { affected } = await this.userRepo
      .createQueryBuilder()
      .softDelete()
      .from(User)
      .where('isVerified = :isVerified', { isVerified: false })
      .andWhere('deletedAt IS NULL')
      .andWhere('createdAt < :cutoff', { cutoff })
      .execute();

    this.logger.log(
      `Soft-deleted ${affected} unverified user(s) older than 7 days`,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async hardDeleteSoftDeletedUsers() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const { affected } = await this.userRepo
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('deletedAt IS NOT NULL')
      .andWhere('deletedAt < :cutoff', { cutoff })
      .execute();

    this.logger.log(
      `Hard-deleted ${affected} user row(s) soft-deleted more than 7 days ago`,
    );
  }
}
