import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from 'src/redis/services/redis.service';
import {
  RATE_LIMIT_KEY,
  RateLimitRule,
} from '../decorators/rate-limit.decorator';
import { ensureVisitorId } from '../utils/vistor';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules = this.reflector.get<RateLimitRule[]>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );
    if (!rules) return true;

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    for (const rule of rules) {
      let identifier: string | undefined;
      if (rule.keyFrom === 'ip') identifier = req.ip;
      else if (rule.keyFrom === 'email')
        identifier = req.body?.email?.toLowerCase();
      else if (rule.keyFrom === 'visitorId')
        identifier = ensureVisitorId(req, res);

      if (!identifier) continue;

      const key = `ratelimit:${rule.keyPrefix}:${identifier}`;
      const count = await this.redisService.incrementWithTTL(
        key,
        rule.ttlSeconds,
      );

      if (count > rule.limit) {
        throw new HttpException(
          'Too many requests. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }
    return true;
  }
}
