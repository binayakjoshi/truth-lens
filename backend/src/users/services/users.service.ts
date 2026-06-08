import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createResponse } from 'src/utils/response-handler';
import { Repository } from 'typeorm';

import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
