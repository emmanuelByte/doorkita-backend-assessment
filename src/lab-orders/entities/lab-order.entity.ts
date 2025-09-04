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
import { User } from '../../users/entities/user.entity';

export enum LabOrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TestType {
  BLOOD_TEST = 'blood_test',
  URINE_TEST = 'urine_test',
  X_RAY = 'x_ray',
  MRI = 'mri',
  CT_SCAN = 'ct_scan',
  ULTRASOUND = 'ultrasound',
  ECG = 'ecg',
  OTHER = 'other',
}

@Entity('lab_orders')
export class LabOrder {
  @ApiProperty({
    description: 'Lab order ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID of the patient (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Column()
  @Index()
  patientId: string;

  @ApiProperty({
    description: 'ID of the doctor who created the order (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Column()
  @Index()
  doctorId: string;

  @ApiProperty({
    description: 'ID of the lab assigned to the order (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440003',
    required: false,
  })
  @Column({ nullable: true })
  labId: string;

  @ApiProperty({
    description: 'Type of test to be performed',
    enum: TestType,
    example: TestType.BLOOD_TEST,
  })
  @Column({
    type: 'enum',
    enum: TestType,
  })
  testType: TestType;

  @ApiProperty({
    description: 'Additional notes for the lab order',
    example: 'Patient has diabetes, please check glucose levels',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({
    description: 'Current status of the lab order',
    enum: LabOrderStatus,
    example: LabOrderStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: LabOrderStatus,
    default: LabOrderStatus.PENDING,
  })
  status: LabOrderStatus;

  @ApiProperty({
    description: 'Scheduled date for the lab test',
    example: '2025-09-15T10:00:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  scheduledDate: Date;

  @ApiProperty({
    description: 'Date when the lab test was completed',
    example: '2025-09-15T14:30:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date;

  @ApiProperty({
    description: 'Lab order creation timestamp',
    example: '2025-09-02T13:14:13.633Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Lab order last update timestamp',
    example: '2025-09-02T13:14:13.633Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'patientId' })
  patient: User;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'labId' })
  lab: User;
}
