import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createResponse } from 'src/common/utils/response-handler';
import { EmailService } from 'src/email/services/email.service';
import { User } from 'src/users/entities/user.entity';
import { IsNull, Repository } from 'typeorm';

import { LoginDto } from '../dtos/login.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { OtpService } from 'src/otp/services/otp.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, email, password } = loginDto;

    if (!username && !email)
      throw new ConflictException('Username or email must be provided');

    let user: User | null = null;

    if (username) {
      user = await this.userRepo.findOne({ where: { username } });

      if (!user)
        throw new NotFoundException(
          'Could not find user with the provided username',
        );
    } else if (email) {
      user = await this.userRepo.findOne({ where: { email } });

      if (!user)
        throw new NotFoundException(
          'Could not find user with the provided email',
        );
    }
    if (!user) throw new NotFoundException('Could not find user');

    if (!user.password)
      throw new UnauthorizedException(
        'This account is linked to Google. Please sign in with Google instead.',
      );
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials. Please try again.');

    if (!user.isVerified) {
      const { code, expiresAt } = await this.otpService.createOtp(user.id);

      this.emailService
        .sendOtpEmail(user.email, user.firstName, code)
        .catch(() => {});

      return createResponse(
        HttpStatus.OK,
        `A 6-digit verification code has been sent to ${user.email}`,
        { email: user.email, expiresAt },
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
      where: { id: decodedUserData.id, deletedAt: IsNull() },
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
          deletedAt: IsNull(),
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

  async resendOtp(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user)
      throw new NotFoundException(
        'Could not find user with the provided email',
      );
    if (user.isVerified)
      throw new ConflictException('User is already verified');

    await this.otpService.deleteOtp(user.id);

    const { code, expiresAt } = await this.otpService.createOtp(user.id);
    this.emailService
      .sendOtpEmail(user.email, user.firstName, code)
      .catch(() => {});

    return createResponse(
      HttpStatus.OK,
      `A new verification code has been sent to ${user.email}`,
      { email: user.email, expiresAt },
    );
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const { email, code } = dto;

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        'Could not find user with the provided email',
      );
    }
    if (user.isVerified) {
      throw new ConflictException('User is already verified');
    }

    const result = await this.otpService.verifyOtp(user.id, code);

    if (result === 'notFound') {
      throw new UnauthorizedException(
        'OTP code has expired. Please request for a new one.',
      );
    }
    if (result === 'invalid') {
      throw new UnauthorizedException('Invalid OTP code. Please try again.');
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

    return createResponse(HttpStatus.OK, 'Email verified successfully', {
      accessToken,
      refreshToken,
      user: userData,
    });
  }

  async verifyResetOtp(dto: VerifyOtpDto) {
    const { email, code } = dto;
    const user = await this.userRepo.findOne({
      where: { email, isVerified: true, deletedAt: IsNull() },
    });
    if (!user)
      throw new NotFoundException(
        'Could not find user with the provided email',
      );

    const result = await this.otpService.verifyOtp(user.id, code);

    if (result === 'notFound') {
      throw new UnauthorizedException(
        'OTP code has expired. Please request for a new one.',
      );
    }
    if (result === 'invalid') {
      throw new UnauthorizedException('Invalid OTP code. Please try again.');
    }
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const verificationToken = this.jwtService.sign(userData, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    return createResponse(HttpStatus.OK, 'OTP code verified successfully.', {
      verificationToken,
      user: userData,
    });
  }

  async findOrCreateGoogleUser(googleUser: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    const { googleId, email, firstName, lastName } = googleUser;

    const byGoogleId = await this.userRepo.findOne({ where: { googleId } });
    if (byGoogleId) return byGoogleId;

    const byEmail = await this.userRepo.findOne({ where: { email } });
    if (byEmail) {
      byEmail.googleId = googleId;
      byEmail.isVerified = true;
      await this.userRepo.save(byEmail); // ← await first
      return byEmail; // ← then return
    }

    const username = await this.generateUniqueUsername(firstName, lastName);

    const newUser = this.userRepo.create({
      googleId,
      email,
      firstName,
      lastName,
      username,
      password: undefined,
      isVerified: true,
    });

    await this.userRepo.save(newUser); // ← await first
    return newUser; // ← then return
  }

  googleLogin(user: User): {
    accessToken: string;
    refreshToken: string;
    userData: object;
  } {
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

    return { accessToken, refreshToken, userData };
  }

  private async generateUniqueUsername(
    firstName: string,
    lastName: string,
  ): Promise<string> {
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');

    const base = `${normalize(firstName)}.${normalize(lastName)}`;
    let username = base;
    let counter = 1;

    while (await this.userRepo.findOne({ where: { username } })) {
      username = `${base}${counter}`;
      counter++;
    }

    return username;
  }
}
