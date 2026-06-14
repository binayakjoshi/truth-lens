import { IsEmail, IsNotEmpty } from 'class-validator';

// resend-otp.dto.ts
export class ResendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
