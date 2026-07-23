import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseFilePipeBuilder,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/common/decorators/auth.decorator';
import { RateLimit } from 'src/common/decorators/rate-limit.decorator';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { ExtendedRequest } from 'src/common/type';

import { SearchHistoryDto } from '../dtos/search-history.dto';
import { AnalysisService } from '../services/analysis.service';
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('/anonymous')
  @RateLimit([
    { keyPrefix: 'visitor', keyFrom: 'visitorId', limit: 5, ttlSeconds: 86400 },
    {
      keyPrefix: 'ip',
      keyFrom: 'ip',
      limit: 15,
      ttlSeconds: 86400,
    },
  ])
  @UseGuards(RateLimitGuard)
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

  @Post('bulk-upload')
  @Auth()
  @UseInterceptors(FilesInterceptor('files', 10))
  async bulkUpload(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    files: Express.Multer.File[],

    @Req() req: any,
  ) {
    return this.analysisService.bulkAnalyzeAndSave(files, req.user.id);
  }
}
