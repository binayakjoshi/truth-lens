import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ nullable: false }) firstName: string;

  @Column({ nullable: false }) lastName: string;

  @Column({ unique: true, nullable: false }) username: string;

  @Column({ unique: true }) email: string;

  @Column({ default: false }) isVerified: boolean;

  @Column({ nullable: false }) password: string;

  @Column({ default: false }) isDeleted: boolean;

  @CreateDateColumn() createdAt: Date;

  @UpdateDateColumn() updatedAt: Date;
}
