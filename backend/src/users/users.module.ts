import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from 'src/email/services/email.service';
import { OtpService } from 'src/otp/services/otp.service';

import { UsersController } from './controllers/users.controller';
import { User } from './entities/user.entity';
import { UserCleanupService } from './services/user-scheduler.service';
import { UsersService } from './services/users.service';
import { UserStat } from './entities/user-stats.entity';
import { UserStatsService } from './services/user-stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserStat])],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserCleanupService,
    EmailService,
    OtpService,
    UserStatsService,
  ],
  exports: [UserStatsService],
})
export class UsersModule {}
