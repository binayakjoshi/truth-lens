import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from 'src/email/services/email.service';

import { UsersController } from './controllers/users.controller';
import { User } from './entities/user.entity';
import { UserCleanupService } from './services/user-scheduler.service';
import { UsersService } from './services/users.service';
import { OtpService } from 'src/otp/services/otp.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UserCleanupService, EmailService, OtpService],
})
export class UsersModule {}
