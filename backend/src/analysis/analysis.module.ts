import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

import { AnalysisController } from './controllers/analysis.controller';
import { AnalysisHistory } from './entities/analysis-history.entity';
import { AnonymousUsage } from './entities/anonymous-usage.entity';
import { AnalysisService } from './services/analysis.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnonymousUsage, AnalysisHistory, User])],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
