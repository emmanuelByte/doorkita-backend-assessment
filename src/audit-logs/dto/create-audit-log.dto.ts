import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';
import { AuditAction, ResourceType } from '../entities/audit-log.entity';

export class CreateAuditLogDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEnum(UserRole)
  @IsNotEmpty()
  userRole: UserRole;

  @IsEnum(AuditAction)
  @IsNotEmpty()
  action: AuditAction;

  @IsEnum(ResourceType)
  @IsNotEmpty()
  resourceType: ResourceType;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  metadata?: any;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  endpoint?: string;

  @IsString()
  @IsOptional()
  method?: string;

  @IsOptional()
  statusCode?: number;

  @IsOptional()
  responseTime?: number;
}
