import * as crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/services/redis.service';

interface OtpPayload {
  hash: string;
  createdAt: string;
}

@Injectable()
export class OtpService {
  private readonly ttlSeconds = 5 * 60;
  private readonly pepper: string;

  constructor(private readonly redisService: RedisService) {
    const secret = process.env.OTP_HASH_SECRET;
    if (!secret) throw new Error('OTP_HASH_SECRET is not set');

    this.pepper = secret;
  }

  private key(userId: string) {
    return `otp:${userId}`;
  }

  private hashOtp(code: string): string {
    return crypto.createHmac('sha256', this.pepper).update(code).digest('hex');
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
    const payload: OtpPayload = {
      hash: this.hashOtp(code),
      createdAt: new Date().toISOString(),
    };
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

    const candidateHash = this.hashOtp(code);
    const valid = crypto.timingSafeEqual(
      Buffer.from(candidateHash),
      Buffer.from(payload.hash),
    );

    if (!valid) return 'invalid';
    await this.deleteOtp(userId);
    return 'valid';
  }
}
