import { Transform } from 'class-transformer';
import { IsNotEmpty, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).+$/, {
    message:
      'Password must contain at least one uppercase letter, one number and one special character',
  })
  password: string;
}
