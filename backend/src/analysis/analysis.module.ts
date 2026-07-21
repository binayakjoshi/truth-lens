import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

import { AnalysisController } from './controllers/analysis.controller';
import { AnalysisHistory } from './entities/analysis-history.entity';
import { AnalysisService } from './services/analysis.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([AnalysisHistory, User]), UsersModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
