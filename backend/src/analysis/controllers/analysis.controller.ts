import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnonymousLimitGuard } from 'src/analysis/guards/anonymous-limit-guard';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ExtendedRequest } from 'src/common/type';

import { SearchHistoryDto } from '../dtos/search-history.dto';
import { AnalysisService } from '../services/analysis.service';
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('/anonymous')
  @UseGuards(AnonymousLimitGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async analyzeImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
        .build({
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.analysisService.analyzeWithoutSave(file);
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

  @Post('/')
  @Auth()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async analyzeImageAndSave(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
        .build({
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('file is required');

    const userId = req.user.id;
    return this.analysisService.analyzeAndSave(file, userId);
  }
}
