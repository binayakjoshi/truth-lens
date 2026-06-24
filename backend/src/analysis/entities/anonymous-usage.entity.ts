import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class AnonymousUsage {
  @PrimaryColumn()
  identifier: string;

  @PrimaryColumn({ type: 'date' })
  usageDate: string;

  @Column({ default: 0 })
  requestCount: number;
}
