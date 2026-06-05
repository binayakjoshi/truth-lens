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
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { LoginDto } from '../dtos/login-dto';
import type { Response, Request } from 'express';
import { CookieInterceptor } from 'src/interceptors/cookie-interceptor';
import { UserResponseDto } from '../dtos/user.dto';
import { Serialize } from 'src/common/decorators/serialize';
import { Auth } from 'src/common/decorators/auth.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
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
