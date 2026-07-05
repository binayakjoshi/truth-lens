import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AnonymousLimitGuard } from 'src/analysis/guards/anonymous-limit-guard';
import { Auth } from 'src/common/decorators/auth.decorator';

import { SearchHistoryDto } from '../dtos/search-history.dto';
import { AnalysisService } from '../services/analysis.service';

export class ExtendedRequest extends Request {
  user: {
    id: string;
  };
}
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('/')
  @UseGuards(AnonymousLimitGuard)
  testLimit() {
    return 'testing';
  }

  @Get('/history')
  @Auth()
  async getUserAnalysisHistory(
    @Query() dto: SearchHistoryDto,
    @Req() req: ExtendedRequest,
  ) {
    return this.analysisService.getAnalysisHistory(req.user.id, dto);
  }
}
