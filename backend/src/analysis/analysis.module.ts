import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

import { AnalysisController } from './controllers/analysis.controller';
import { AnalysisHistory } from './entities/analysis-history.entity';
import { AnalysisService } from './services/analysis.service';
import { RedisService } from 'src/redis/services/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnalysisHistory, User])],
  controllers: [AnalysisController],
  providers: [AnalysisService, RedisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
