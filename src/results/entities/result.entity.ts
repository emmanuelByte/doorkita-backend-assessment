import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Lab result ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID of the lab order this result belongs to (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Column()
  @Index()
  labOrderId: string;

  @ApiProperty({
    description: 'ID of the lab that performed the test (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Column()
  @Index()
  labId: string;

  @ApiProperty({
    description: 'The main result text/findings',
    example: 'Blood glucose level: 120 mg/dL (Normal range: 70-100 mg/dL)',
  })
  @Column({ type: 'text' })
  resultText: string;

  @ApiProperty({
    description: 'Additional comments from the lab technician',
    example: 'Sample collected at 8:00 AM after 12-hour fast',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  comments: string;

  @ApiProperty({
    description: 'Current status of the lab result',
    enum: ResultStatus,
    example: ResultStatus.COMPLETED,
  })
  @Column({
    type: 'enum',
    enum: ResultStatus,
    default: ResultStatus.PENDING,
  })
  status: ResultStatus;

  @ApiProperty({
    description: 'Date when the result was completed',
    example: '2025-09-15T14:30:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @ApiProperty({
    description: 'File attachments (reports, images, etc.)',
    example: ['report.pdf', 'image.jpg'],
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  attachments: any;

  @ApiProperty({
    description: 'Detailed findings and observations',
    example:
      'Elevated glucose levels detected. Recommend follow-up with endocrinologist.',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  findings: string;

  @ApiProperty({
    description: 'Medical recommendations based on results',
    example:
      'Schedule follow-up appointment within 1 week. Monitor blood sugar levels daily.',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @ApiProperty({
    description: 'Lab result creation timestamp',
    example: '2025-09-02T13:14:13.633Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Lab result last update timestamp',
    example: '2025-09-02T13:14:13.633Z',
  })
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
