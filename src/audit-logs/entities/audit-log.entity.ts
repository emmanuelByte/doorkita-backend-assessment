import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from '../../users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  ASSIGN = 'assign',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
}

export enum ResourceType {
  USER = 'user',
  LAB_ORDER = 'lab_order',
  RESULT = 'result',
  AUDIT_LOG = 'audit_log',
  AUTH = 'auth',
}

@Entity('audit_logs')
export class AuditLog {
  @ApiProperty({
    description: 'Audit log ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID of the user who performed the action (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Column()
  @Index()
  userId: string;

  @ApiProperty({
    description: 'Role of the user who performed the action',
    enum: UserRole,
    example: UserRole.DOCTOR,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
  })
  userRole: UserRole;

  @ApiProperty({
    description: 'Type of action performed',
    enum: AuditAction,
    example: AuditAction.CREATE,
  })
  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @ApiProperty({
    description: 'Type of resource being acted upon',
    enum: ResourceType,
    example: ResourceType.USER,
  })
  @Column({
    type: 'enum',
    enum: ResourceType,
  })
  resourceType: ResourceType;

  @ApiProperty({
    description: 'ID of the resource being acted upon',
    example: '1',
    required: false,
  })
  @Column({ nullable: true })
  resourceId: string;

  @ApiProperty({
    description: 'Human-readable description of the action',
    example: 'User created new lab order for patient',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'Additional metadata about the action',
    example: { patientId: 3, testType: 'blood_test' },
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @ApiProperty({
    description: 'IP address of the user',
    example: '192.168.1.100',
    required: false,
  })
  @Column({ nullable: true })
  ipAddress: string;

  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false,
  })
  @Column({ nullable: true })
  userAgent: string;

  @ApiProperty({
    description: 'API endpoint that was accessed',
    example: '/lab-orders',
    required: false,
  })
  @Column({ nullable: true })
  endpoint: string;

  @ApiProperty({
    description: 'HTTP method used',
    example: 'POST',
    required: false,
  })
  @Column({ nullable: true })
  method: string;

  @ApiProperty({
    description: 'HTTP status code of the response',
    example: 201,
    required: false,
  })
  @Column({ type: 'integer', nullable: true })
  statusCode: number;

  @ApiProperty({
    description: 'Response time in milliseconds',
    example: 150,
    required: false,
  })
  @Column({ type: 'integer', nullable: true })
  responseTime: number;

  @ApiProperty({
    description: 'Timestamp when the action occurred',
    example: '2025-09-02T13:14:13.633Z',
  })
  @CreateDateColumn()
  timestamp: Date;
}
