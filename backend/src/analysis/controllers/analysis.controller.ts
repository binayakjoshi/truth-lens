import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalysisService } from '../services/analysis.service';
import { AnonymousLimitGuard } from 'src/guards/anonymous-limit-guard';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('/')
  @UseGuards(AnonymousLimitGuard)
  async testLimit() {
    return 'testing';
  }
}
