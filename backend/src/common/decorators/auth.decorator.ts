import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ResetPasswordGuard } from 'src/users/guards/reset-password.guard';

export const Auth = () => {
  return applyDecorators(UseGuards(AuthGuard));
};

export const ResetPassword = () => {
  return applyDecorators(UseGuards(ResetPasswordGuard));
};
