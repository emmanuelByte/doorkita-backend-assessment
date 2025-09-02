import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LabOrder } from '../../lab-orders/entities/lab-order.entity';
import { User } from '../../users/entities/user.entity';

export enum ResultStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('results')
export class Result {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  labOrderId: number;

  @Column()
  @Index()
  labId: number;

  @Column({ type: 'text' })
  resultText: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({
    type: 'enum',
    enum: ResultStatus,
    default: ResultStatus.PENDING,
  })
  status: ResultStatus;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  attachments: any;

  @Column({ type: 'text', nullable: true })
  findings: string;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => LabOrder, { eager: false })
  @JoinColumn({ name: 'labOrderId' })
  labOrder: LabOrder;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'labId' })
  lab: User;
}
