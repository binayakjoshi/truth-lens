import { randomInt } from 'crypto';

import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/services/email.service';
import { createResponse } from 'src/utils/response-handler';
import { IsNull, Repository } from 'typeorm';

import { CreateUserDto } from '../dtos/create-user.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { OtpRecord } from '../entities/otp-record.entity';
import { User } from '../entities/user.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(OtpRecord)
    private readonly otpRepo: Repository<OtpRecord>,
    private readonly emailService: EmailService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const { username, email, password, firstName, lastName } = createUserDto;

    const [existingUsername, existingEmail] = await Promise.all([
      this.userRepo.findOne({ where: { username } }),
      this.userRepo.findOne({ where: { email } }),
    ]);

    if (existingUsername) {
      throw new ConflictException('Username already in use');
    }

    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      deletedAt: null,
    });

    const savedUser = await this.userRepo.save(user);

    const { password: _, ...result } = savedUser;

    return createResponse(
      HttpStatus.CREATED,
      'User created successfully',
      result,
    );
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    const user = await this.userRepo.findOne({
      where: { email, deletedAt: IsNull(), isVerified: true },
    });
    if (!user)
      throw new NotFoundException(
        'Could not find user for the provided email.',
      );
    const code = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const otpRecord = this.otpRepo.create({
      user,
      userId: user.id,
      expiresAt,
      code,
    });
    this.otpRepo.save(otpRecord);

    this.emailService
      .sendOtpEmail(user.email, user.firstName, code)
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

  async resetPassword(dto: ResetPasswordDto, id: string) {
    const { password } = dto;

    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) throw new NotFoundException('Active user not found');

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await this.userRepo.save(user);
    return createResponse(
      HttpStatus.OK,
      'Password updated sucessfully. Please Login with your new password.',
    );
  }
  private generateOtp(): string {
    return String(randomInt(0, 1_000_000)).padStart(6, '0');
  }
  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, _updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
