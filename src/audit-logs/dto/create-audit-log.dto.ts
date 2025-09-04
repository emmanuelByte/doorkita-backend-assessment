import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';
import { AuditAction, ResourceType } from '../entities/audit-log.entity';

export class CreateAuditLogDto {
  @ApiProperty({
    description: 'ID of the user who performed the action (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Role of the user who performed the action',
    enum: UserRole,
    example: UserRole.DOCTOR,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  userRole: UserRole;

  @ApiProperty({
    description: 'Type of action performed',
    enum: AuditAction,
    example: AuditAction.CREATE,
  })
  @IsEnum(AuditAction)
  @IsNotEmpty()
  action: AuditAction;

  @ApiProperty({
    description: 'Type of resource being acted upon',
    enum: ResourceType,
    example: ResourceType.USER,
  })
  @IsEnum(ResourceType)
  @IsNotEmpty()
  resourceType: ResourceType;

  @ApiProperty({
    description: 'ID of the resource being acted upon',
    example: '1',
    required: false,
  })
  @IsString()
  @IsOptional()
  resourceId?: string;

  @ApiProperty({
    description: 'Human-readable description of the action',
    example: 'User created new lab order for patient',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Additional metadata about the action',
    example: { patientId: 3, testType: 'blood_test' },
    required: false,
  })
  @IsOptional()
  metadata?: any;

  @ApiProperty({
    description: 'IP address of the user',
    example: '192.168.1.100',
    required: false,
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false,
  })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiProperty({
    description: 'API endpoint that was accessed',
    example: '/lab-orders',
    required: false,
  })
  @IsString()
  @IsOptional()
  endpoint?: string;

  @ApiProperty({
    description: 'HTTP method used',
    example: 'POST',
    required: false,
  })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiProperty({
    description: 'HTTP status code of the response',
    example: 201,
    required: false,
  })
  @IsOptional()
  statusCode?: number;

  @ApiProperty({
    description: 'Response time in milliseconds',
    example: 150,
    required: false,
  })
  @IsOptional()
  responseTime?: number;
}
