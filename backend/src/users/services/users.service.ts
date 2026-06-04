import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { createResponse } from 'src/utils/response-handler';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dtos/login-dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly jwtService: JwtService,
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
      isDeleted: false,
    });

    const savedUser = await this.userRepo.save(user);

    const { password: _, ...result } = savedUser;

    return createResponse(
      HttpStatus.CREATED,
      'User created successfully',
      result,
    );
  }

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
      throw new ConflictException('Invalid credentials. Please try again.');
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
  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
