import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ensureVisitorId } from 'src/common/utils/vistor';

import { AnalysisService } from '../services/analysis.service';

@Injectable()
export class AnonymousLimitGuard implements CanActivate {
  private readonly VISITOR_LIMIT = 5;
  private readonly IP_LIMIT = 15;

  constructor(private readonly analysisService: AnalysisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const visitorId = ensureVisitorId(req, res);

    const [visitorCount, ipCount] = await this.analysisService.incrementMany([
      `visitor:${visitorId}`,
      `ip:${req.ip}`,
    ]);

    if (visitorCount > this.VISITOR_LIMIT || ipCount > this.IP_LIMIT) {
      throw new HttpException(
        'Daily anonymous limit reached',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
