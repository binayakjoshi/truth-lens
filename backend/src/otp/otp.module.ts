import { Module } from '@nestjs/common';
import { RedisService } from 'src/redis/services/redis.service';

import { OtpService } from './services/otp.service';

@Module({
  providers: [OtpService, RedisService],
})
export class OtpModule {}
