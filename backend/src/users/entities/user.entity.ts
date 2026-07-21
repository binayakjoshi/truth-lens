import { AnalysisHistory } from 'src/analysis/entities/analysis-history.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  DeleteDateColumn,
  OneToOne,
} from 'typeorm';
import { UserStat } from './user-stats.entity';

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

  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  googleId: string | null;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UserStat, (userStat) => userStat.user)
  userStat: UserStat;

  @OneToMany(() => AnalysisHistory, (ah) => ah.user)
  analysisHistories: AnalysisHistory[];
}
