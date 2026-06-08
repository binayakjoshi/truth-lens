import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from 'src/users/dtos/login-dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { createResponse } from 'src/utils/response-handler';
import { otpEmailTemplate } from '../template/otp-email-template';
import { OtpRecord } from 'src/users/entities/otp-record.entity';

import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
@Injectable()
export class AuthService {
  private readonly transporter: Transporter;
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(OtpRecord)
    private readonly otpRecordRepo: Repository<OtpRecord>,
    private readonly jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  private readonly logger = new Logger(AuthService.name);

  async login(loginDto: LoginDto) {
    const { username, email, password } = loginDto;

    if (!username && !email) {
      throw new ConflictException('Username or email must be provided');
    }

    let user: User | null = null;

    if (username) {
      user = await this.userRepo.findOne({ where: { username } });

      if (!user) {
        throw new NotFoundException(
          'Could not find user with the provided username',
        );
      }
    } else if (email) {
      user = await this.userRepo.findOne({ where: { email } });

      if (!user) {
        throw new NotFoundException(
          'Could not find user with the provided email',
        );
      }
    }
    if (!user) throw new NotFoundException('Could not find user');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials. Please try again.');
    }

    if (!user.isVerified) {
      const otpCode = this.generateOtp();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      const otpRecord = this.otpRecordRepo.create({
        user,
        userId: user.id,
        expiresAt,
        code: otpCode,
      });
      await this.otpRecordRepo.save(otpRecord);
      await this.sendOtpEmail(user.email, user.firstName, otpCode);

      return createResponse(
        HttpStatus.OK,
        `A 6-digit verification code has been sent to ${user.email}`,
        { email: user.email },
      );
    }

    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
    };
    const accessToken = this.jwtService.sign(userData, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(userData, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });
    return createResponse(HttpStatus.OK, 'Login successful', {
      accessToken,
      refreshToken,
      user: userData,
    });
  }

  async tokenVerification(accessToken: string) {
    if (!process.env.JWT_SECRET) {
      throw new NotFoundException('JWT secret is not provided');
    }

    const decodedUserData = this.jwtService.verify(accessToken, {
      secret: process.env.JWT_SECRET,
    });

    if (!decodedUserData)
      throw new UnauthorizedException('token validation failed.');
    const user = await this.userRepo.findOne({
      where: { id: decodedUserData.id, isDeleted: false },
    });
    if (!user) throw new NotFoundException('Active user not found.');

    return createResponse(HttpStatus.OK, 'token validated successfully.', user);
  }

  async refreshAccessToken(refreshToken: string) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userRepo.findOne({
        where: {
          id: payload.id,
          isDeleted: false,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newAccessToken = this.jwtService.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      );

      return createResponse(HttpStatus.OK, 'Access token refreshed', {
        accessToken: newAccessToken,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateOtp(): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < 6; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  private async sendOtpEmail(
    toEmail: string,
    firstName: string,
    otp: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `${process.env.GMAIL_USER}`,

        to: toEmail,
        subject: `${otp} is your TruthLens verification code`,
        html: otpEmailTemplate(otp, firstName),
      });

      this.logger.log(`OTP email sent to ${toEmail}`);
    } catch (err) {
      this.logger.error(
        `Unexpected error sending OTP to ${toEmail}`,
        err instanceof Error ? err.stack : String(err),
      );

      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }
}
