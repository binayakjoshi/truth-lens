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
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { LoginDto } from '../dtos/login-dto';
import type { Response } from 'express';
import { CookieInterceptor } from 'src/interceptors/cookie-interceptor';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const result = this.usersService.create(createUserDto);
    return result;
  }

  @Post('/login')
  @UseInterceptors(CookieInterceptor)
  async userLogin(
    @Body() loginDto: LoginDto,

    @Res({ passthrough: true }) res: Response,
  ) {
    const result = this.usersService.login(loginDto) as any;

    res.locals.accessToken = result.data?.accessToken;
    res.locals.refreshToken = result.data?.refreshToken;

    return {
      success: result.success,
      message: result.message,
      status: result.status,
    };
  }
  @Get(':id')
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
