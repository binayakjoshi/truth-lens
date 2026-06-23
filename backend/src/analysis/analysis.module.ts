import { Module } from '@nestjs/common';
import { AnalysisController } from './controllers/analysis.controller';
import { AnalysisService } from './services/analysis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnonymousUsage } from './entities/anonymous-usage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnonymousUsage])],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
