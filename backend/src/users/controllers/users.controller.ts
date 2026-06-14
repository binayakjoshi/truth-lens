import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
} from '@nestjs/common';
import { type Response } from 'express';
import { COOKIE_NAMES } from 'src/common/cookie';
import { ResetPassword } from 'src/common/decorators/auth.decorator';
import { Serialize } from 'src/common/decorators/serialize';

import { CreateUserDto } from '../dtos/create-user.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user.dto';
import { UsersService } from '../services/users.service';

class CustomRequest extends Request {
  user: {
    id: string;
    emai: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.usersService.create(createUserDto);
    return result;
  }
  @Post('/forgot-password')
  async forgotPasswrod(@Body() dto: ForgotPasswordDto) {
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
