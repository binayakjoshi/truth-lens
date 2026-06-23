import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnonymousLimitGuard } from 'src/guards/anonymous-limit-guard';

import { AnalysisService } from '../services/analysis.service';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('/')
  @UseGuards(AnonymousLimitGuard)
  testLimit() {
    return 'testing';
  }
}
