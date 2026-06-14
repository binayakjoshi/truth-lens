import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from 'src/email/services/email.service';
import { OtpRecord } from 'src/users/entities/otp-record.entity';
import { User } from 'src/users/entities/user.entity';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [AuthController],
  providers: [AuthService, EmailService, GoogleStrategy],

  imports: [TypeOrmModule.forFeature([User, OtpRecord]), PassportModule],
})
export class AuthModule {}
