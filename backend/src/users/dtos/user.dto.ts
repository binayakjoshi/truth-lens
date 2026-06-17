import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  isVerified: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  deletedAt: boolean;
}
