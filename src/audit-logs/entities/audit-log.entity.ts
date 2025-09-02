import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from '../../users/entities/user.entity';

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
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  userRole: UserRole;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: ResourceType,
  })
  resourceType: ResourceType;

  @Column({ nullable: true })
  resourceId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  endpoint: string;

  @Column({ nullable: true })
  method: string;

  @Column({ type: 'integer', nullable: true })
  statusCode: number;

  @Column({ type: 'integer', nullable: true })
  responseTime: number;

  @CreateDateColumn()
  timestamp: Date;
}
