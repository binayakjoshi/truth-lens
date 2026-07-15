import { Module } from '@nestjs/common';
import { OtpService } from './services/otp.service';
import { RedisService } from 'src/redis/services/redis.service';

@Module({
  providers: [OtpService, RedisService],
})
export class OtpModule {}
