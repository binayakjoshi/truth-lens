import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from 'src/email/services/email.service';
import { User } from 'src/users/entities/user.entity';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { RedisService } from 'src/redis/services/redis.service';
import { OtpService } from 'src/otp/services/otp.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    GoogleStrategy,
    RedisService,
    OtpService,
  ],

  imports: [TypeOrmModule.forFeature([User]), PassportModule],
})
export class AuthModule {}
