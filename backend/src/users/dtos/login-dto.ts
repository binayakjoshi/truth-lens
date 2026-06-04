import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { IsUsernameOrEmail } from 'src/utils/login.validator';

export class LoginDto {
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message:
      'Username must start with a lowercase letter and contain only lowercase letters, numbers, and underscores',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim().toLowerCase())
  username?: string;

  @IsEmail()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  email?: string;

  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'Password must contain at least one number and one special character',
  })
  password: string;

  @IsUsernameOrEmail({
    message: 'Either username or email must be provided, but not both',
  })
  auth: string;
}
