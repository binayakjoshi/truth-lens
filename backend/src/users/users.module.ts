import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from 'src/email/services/email.service';
import { OtpService } from 'src/otp/services/otp.service';

import { UsersController } from './controllers/users.controller';
import { UserStat } from './entities/user-stats.entity';
import { User } from './entities/user.entity';
import { UserCleanupService } from './services/user-scheduler.service';
import { UserStatsService } from './services/user-stats.service';
import { UsersService } from './services/users.service';

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
