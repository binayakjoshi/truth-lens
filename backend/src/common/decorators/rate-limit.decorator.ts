import { SetMetadata } from '@nestjs/common';

export interface RateLimitRule {
  keyPrefix: string;
  limit: number;
  ttlSeconds: number;
  keyFrom: 'ip' | 'email' | 'visitorId';
}
export const RATE_LIMIT_KEY = 'rate_limit_rules';
export const RateLimit = (rules: RateLimitRule[]) =>
  SetMetadata(RATE_LIMIT_KEY, rules);
