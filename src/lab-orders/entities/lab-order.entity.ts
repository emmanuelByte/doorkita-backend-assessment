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
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  patientId: number;

  @Column()
  @Index()
  doctorId: number;

  @Column({ nullable: true })
  labId: number;

  @Column({
    type: 'enum',
    enum: TestType,
  })
  testType: TestType;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: LabOrderStatus,
    default: LabOrderStatus.PENDING,
  })
  status: LabOrderStatus;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date;

  @CreateDateColumn()
  createdAt: Date;

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
