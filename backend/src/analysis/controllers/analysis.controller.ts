import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { AnonymousLimitGuard } from 'src/guards/anonymous-limit-guard';

import { AnalysisService } from '../services/analysis.service';

@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly httpService: HttpService,
  ) {}

  @Get('/')
  @UseGuards(AnonymousLimitGuard)
  testLimit() {
    return 'testing';
  }

  @Post('/')
  @UseInterceptors(FileInterceptor('file'))
  async analyze(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('file', blob, file.originalname);

    const { data } = await firstValueFrom(
      this.httpService.post('http://ml-model:8000/api/v1/predict', formData),
    );

    return data;
  }
}
