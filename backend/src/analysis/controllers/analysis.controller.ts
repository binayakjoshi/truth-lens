import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AnonymousLimitGuard } from 'src/analysis/guards/anonymous-limit-guard';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ExtendedRequest } from 'src/common/type';

import { SearchHistoryDto } from '../dtos/search-history.dto';
import { AnalysisService } from '../services/analysis.service';

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
    return this.analysisService.getAnalysisHistories(req.user.id, dto);
  }

  @Get('/history/:id')
  @Auth()
  async getSingleUserAnalysisHistory(
    @Param('id') id: string,
    @Req() req: ExtendedRequest,
  ) {
    return this.analysisService.getSingleAnalysisHistory(req.user.id, id);
  }
}
