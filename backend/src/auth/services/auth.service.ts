import { randomInt } from 'crypto';

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
import { OtpRecord } from 'src/users/entities/otp-record.entity';
import { User } from 'src/users/entities/user.entity';
import { IsNull, Repository } from 'typeorm';

import { LoginDto } from '../dtos/login.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(OtpRecord)
    private readonly otpRecordRepo: Repository<OtpRecord>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

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
      this.emailService
        .sendOtpEmail(user.email, user.firstName, otpCode)
        .catch(() => {});

      return createResponse(
        HttpStatus.OK,
        `A 6-digit verification code has been sent to ${user.email}`,
        {
          email: user.email,
          expiresAt: otpRecord.expiresAt,
        },
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
    if (!user) {
      throw new NotFoundException(
        'Could not find user with the provided email',
      );
    }
    if (user.isVerified) {
      throw new ConflictException('User is already verified');
    }

    await this.otpRecordRepo.update(
      { userId: user.id, isUsed: false },
      { isUsed: true },
    );

    const otpCode = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const otpRecord = this.otpRecordRepo.create({
      user,
      userId: user.id,
      expiresAt,
      code: otpCode,
    });
    await this.otpRecordRepo.save(otpRecord);
    this.emailService
      .sendOtpEmail(user.email, user.firstName, otpCode)
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

    const otpRecord = await this.otpRecordRepo.findOne({
      where: { userId: user.id, code, isUsed: false },
      order: { createdAt: 'DESC' }, // always pick the latest
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid OTP code. Please try again.');
    }
    if (otpRecord.expiresAt < new Date()) {
      throw new UnauthorizedException(
        'OTP code has expired. Please request for a new one.',
      );
    }

    await this.otpRecordRepo.manager.transaction(async (manager) => {
      await manager.update(OtpRecord, { id: otpRecord.id }, { isUsed: true });
      await manager.update(User, { id: user.id }, { isVerified: true });
    });

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

    const otpRecord = await this.otpRecordRepo.findOne({
      where: { userId: user.id, code, isUsed: false },
      order: { createdAt: 'DESC' }, // always pick the latest
    });

    if (!otpRecord)
      throw new UnauthorizedException('Invalid OTP code. Please try again.');
    if (otpRecord.expiresAt < new Date())
      throw new UnauthorizedException(
        'OTP code has expired. Please request for a new one.',
      );

    await this.otpRecordRepo.manager.transaction(async (manager) => {
      await manager.update(OtpRecord, { id: otpRecord.id }, { isUsed: true });
      await manager.update(User, { id: user.id }, { isVerified: true });
    });

    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
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

  private generateOtp(): string {
    return String(randomInt(0, 1_000_000)).padStart(6, '0');
  }
}
