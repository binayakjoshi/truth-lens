import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './controllers/users.controller';
import { OtpRecord } from './entities/otp-record.entity';
import { User } from './entities/user.entity';
import { UserCleanupService } from './services/user-scheduler.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, OtpRecord])],
  controllers: [UsersController],
  providers: [UsersService, UserCleanupService],
})
export class UsersModule {}
