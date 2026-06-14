import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from 'src/email/services/email.service';
import { OtpRecord } from 'src/users/entities/otp-record.entity';
import { User } from 'src/users/entities/user.entity';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, EmailService],

  imports: [TypeOrmModule.forFeature([User, OtpRecord])],
})
export class AuthModule {}
