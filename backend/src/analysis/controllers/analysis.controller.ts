import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Auth } from 'src/common/decorators/auth.decorator';
import { AnonymousLimitGuard } from 'src/guards/anonymous-limit-guard';

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
