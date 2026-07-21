import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { type Response } from 'express';
import { COOKIE_NAMES } from 'src/auth/constants/cookie';
import { Auth, ResetPassword } from 'src/common/decorators/auth.decorator';
import { RateLimit } from 'src/common/decorators/rate-limit.decorator';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';

import { CreateUserDto } from '../dtos/create-user.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { UsersService } from '../services/users.service';
import { ExtendedRequest } from 'src/common/type';
import { UserStatsService } from '../services/user-stats.service';

class CustomRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userstatService: UserStatsService,
  ) {}

  @Post('/signup')
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.usersService.create(createUserDto);
    return result;
  }
  @Post('/forgot-password')
  @RateLimit([
    {
      keyPrefix: 'otp-req-email',
      limit: 3,
      ttlSeconds: 3600,
      keyFrom: 'email',
    },
    { keyPrefix: 'otp-req-ip', limit: 10, ttlSeconds: 3600, keyFrom: 'ip' },
  ])
  @UseGuards(RateLimitGuard)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.usersService.forgotPassword(dto);
  }

  @Post('/reset-password')
  @ResetPassword()
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Req() req: CustomRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.usersService.resetPassword(dto, req.user.id);
    res.clearCookie(COOKIE_NAMES.VERIFICATION_TOKEN);

    return {
      sucess: result.success,
      message: result.message,
      status: result.status,
      data: null,
    };
  }

  @Get('/stats')
  @Auth()
  async getUserStats(@Req() req: ExtendedRequest) {
    return this.userstatService.getUserStat(req.user.id);
  }
}
