import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseInterceptors,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { COOKIE_NAMES } from 'src/common/cookie';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Serialize } from 'src/common/decorators/serialize';
import { RefreshTokenGuard } from 'src/guards/refresh-token.guard';
import { CookieInterceptor } from 'src/interceptors/cookie-interceptor';

import { CreateUserDto } from '../dtos/create-user.dto';
import { LoginDto } from '../dtos/login-dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.usersService.create(createUserDto);
    return result;
  }

  @Post('/login')
  @UseInterceptors(CookieInterceptor)
  async userLogin(
    @Body() loginDto: LoginDto,

    @Res({ passthrough: true }) res: Response,
  ) {
    const result = (await this.usersService.login(loginDto)) as any;

    res.locals.accessToken = result.data?.accessToken;
    res.locals.refreshToken = result.data?.refreshToken;

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
    const result = this.usersService.tokenVerification(accessToken);
    return result;
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

    const result = (await this.usersService.refreshAccessToken(
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
  @Get(':id')
  @Serialize(UserResponseDto)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
