import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { RedisService } from 'src/redis/services/redis.service';

interface OtpPayload {
  code: string;
  createdAt: string;
}

@Injectable()
export class OtpService {
  private readonly ttlSeconds = 5 * 60;

  constructor(private readonly redisService: RedisService) {}

  private key(userId: string) {
    return `otp:${userId}`;
  }

  generateOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  async getOtp(userId: string): Promise<OtpPayload | null> {
    const raw = await this.redisService.get(this.key(userId));
    if (!raw) return null;
    return JSON.parse(raw) as OtpPayload;
  }

  async deleteOtp(userId: string): Promise<void> {
    await this.redisService.del(this.key(userId));
  }
  async createOtp(userId: string): Promise<{ code: string; expiresAt: Date }> {
    const code = this.generateOtp();
    const payload: OtpPayload = { code, createdAt: new Date().toISOString() };

    await this.redisService.set(
      this.key(userId),
      JSON.stringify(payload),
      this.ttlSeconds,
    );

    const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000);
    return { code, expiresAt };
  }
  async verifyOtp(
    userId: string,
    code: string,
  ): Promise<'notFound' | 'invalid' | 'valid'> {
    const payload = await this.getOtp(userId);
    if (!payload) return 'notFound';
    if (payload.code !== code) return 'invalid';
    await this.deleteOtp(userId);
    return 'valid';
  }
}
