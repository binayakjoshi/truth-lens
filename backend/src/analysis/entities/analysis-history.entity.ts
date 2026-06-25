import { User } from 'src/users/entities/user.entity';
import { DecimalTransformer } from 'src/utils/transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

enum ClassificationResult {
  REAL = 'real',
  FAKE = 'fake',
}
@Entity()
@Index(['userId', 'createdAt'])
export class AnalysisHistory {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ type: 'enum', enum: ClassificationResult })
  classification: ClassificationResult;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.analysisHistories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 4,
    transformer: DecimalTransformer,
    nullable: false,
    default: 0,
  })
  confidence: number;

  @Column({ type: 'varchar', nullable: false }) originalImageUrl: string;

  @Column({ type: 'varchar', nullable: false }) heatmapImageUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
