import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { OtpRecord } from './otp-record.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Index()
  @Column({ unique: true, nullable: false })
  username: string;

  @Index()
  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: false })
  password: string;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OtpRecord, (otp) => otp.user) otpRecord: OtpRecord;
}
