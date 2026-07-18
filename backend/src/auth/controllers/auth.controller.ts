import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Serialize } from 'src/common/decorators/serialize';
import { UserResponseDto } from 'src/users/dtos/user.dto';
import { User } from 'src/users/entities/user.entity';

import { COOKIE_NAMES, COOKIE_OPTIONS } from '../constants/cookie';
import { LoginDto } from '../dtos/login.dto';
import { ResendOtpDto } from '../dtos/resend-otp.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { CookieInterceptor } from '../interceptors/cookie-interceptor';
import { AuthService } from '../services/auth.service';
import { RateLimit } from 'src/common/decorators/rate-limit.decorator';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @UseInterceptors(CookieInterceptor)
  async userLogin(
    @Body() loginDto: LoginDto,

    @Res({ passthrough: true }) res: Response,
  ) {
    const result = (await this.authService.login(loginDto)) as any;

    res.locals.accessToken = result.data?.accessToken;
    res.locals.refreshToken = result.data?.refreshToken;

    return {
      success: result.success,
      message: result.message,
      status: result.status,
      data: {
        email: result.data.email,
        otpExpiration: result.data.expiresAt ?? null,
      },
    };
  }

  @Get('/me')
  @Auth()
  @Serialize(UserResponseDto)
  async getMe(@Req() req: Request) {
    const accessToken = req.cookies?.['truth-access-token'];
    if (!accessToken) throw new UnauthorizedException('No access token found.');
    const result = await this.authService.tokenVerification(accessToken);
    return result;
  }

  @Post('/resend-otp')
  @UseInterceptors(CookieInterceptor)
  async resendOtp(
    @Body() resendOtpDto: ResendOtpDto,

    @Res({ passthrough: true }) res: Response,
  ) {
    const result = (await this.authService.resendOtp(
      resendOtpDto.email,
    )) as any;
    if (result.message.includes('verification'))
      res.locals.verificationEmail = result.data?.email;

    return {
      success: result.success,
      message: result.message,
      status: result.status,
      data: {
        email: result.data.email,
        otpExpiration: result.data.expiresAt ?? null,
      },
    };
  }

  @Post('/verify-otp')
  @UseInterceptors(CookieInterceptor)
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,

    @Res({ passthrough: true }) res: Response,
  ) {
    const result = (await this.authService.verifyOtp(verifyOtpDto)) as any;
    res.locals.accessToken = result.data?.accessToken;
    res.locals.refreshToken = result.data?.refreshToken;
    return {
      success: result.success,
      message: result.message,
      status: result.status,
      data: null,
    };
  }

  @Post('/verify-reset-password')
  @RateLimit([
    {
      keyPrefix: 'otp-verify-email',
      limit: 10,
      ttlSeconds: 3600,
      keyFrom: 'email',
    },
    { keyPrefix: 'otp-verify-ip', limit: 20, ttlSeconds: 3600, keyFrom: 'ip' },
  ])
  @UseGuards(RateLimitGuard)
  @UseInterceptors(CookieInterceptor)
  async verifyResetOtp(
    @Body() verifyOtpDto: VerifyOtpDto,

    @Res({ passthrough: true }) res: Response,
  ) {
    const result = (await this.authService.verifyResetOtp(verifyOtpDto)) as any;

    res.locals.verificationToken = result.data.verificationToken;

    return {
      success: result.success,
      message: result.message,
      status: result.status,
      data: null,
    };
  }

  @Get('/refresh')
  @UseGuards(RefreshTokenGuard)
  @UseInterceptors(CookieInterceptor)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['truth-refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }

    const result = (await this.authService.refreshAccessToken(
      refreshToken,
    )) as any;

    res.locals.accessToken = result.data.accessToken;

    return {
      success: true,
      message: 'Access token refreshed successfully',
      status: 200,
      data: null,
    };
  }

  @Get('/logout')
  @Auth()
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, { path: '/' });
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { path: '/' });

    return {
      success: true,
      message: 'User successfully logged out',
      status: 200,
      data: null,
    };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(
    @Req() req: Request & { user: User },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = this.authService.googleLogin(
      req.user,
    );
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, COOKIE_OPTIONS.ACCESS);
    res.cookie(
      COOKIE_NAMES.REFRESH_TOKEN,
      refreshToken,
      COOKIE_OPTIONS.REFRESH,
    );

    res.redirect(process.env.FRONTEND_URL ?? 'http://localhost:3000');
  }
}
