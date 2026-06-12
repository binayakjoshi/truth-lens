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
import { COOKIE_NAMES } from 'src/common/cookie';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Serialize } from 'src/common/decorators/serialize';
import { RefreshTokenGuard } from 'src/guards/refresh-token.guard';
import { CookieInterceptor } from 'src/interceptors/cookie-interceptor';
import { UserResponseDto } from 'src/users/dtos/user.dto';

import { LoginDto } from '../dtos/login-dto';
import { ResendOtpDto } from '../dtos/resend-otp.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { AuthService } from '../services/auth.service';
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

    if (result.message.includes('verification'))
      res.locals.verificationEmail = result.data?.email;
    else {
      res.locals.accessToken = result.data?.accessToken;
      res.locals.refreshToken = result.data?.refreshToken;
    }

    return {
      success: result.success,
      message: result.message,
      status: result.status,
      data: null,
    };
  }

  @Get('/me')
  @Auth()
  @Serialize(UserResponseDto)
  async getMe(@Req() req: Request) {
    const accessToken = req.cookies?.['truth-access-token'];
    if (!accessToken) throw new UnauthorizedException('No access token found.');
    const result = this.authService.tokenVerification(accessToken);
    return result;
  }
  @Post('/resend-otp')
  @UseInterceptors(CookieInterceptor)
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto.email);
  }

  @Post('/verify-otp')
  @UseInterceptors(CookieInterceptor)
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,

    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const verificationEmail = req.cookies?.['truth-verification-email'];
    if (!verificationEmail)
      throw new UnauthorizedException(
        'verification time has expired please try again.',
      );
    const result = (await this.authService.verifyOtp(
      verificationEmail,
      verifyOtpDto.code,
    )) as any;
    res.locals.accessToken = result.data?.accessToken;
    res.locals.refreshToken = result.data?.refreshToken;
    res.clearCookie('truth-verification-email');
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
}
