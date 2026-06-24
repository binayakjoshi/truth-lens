import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalysisController } from './controllers/analysis.controller';
import { AnonymousUsage } from './entities/anonymous-usage.entity';
import { AnalysisService } from './services/analysis.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnonymousUsage])],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
