import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { UserRole } from '../users/entities/user.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import {
  AuditAction,
  AuditLog,
  ResourceType,
} from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogsRepository: Repository<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogsRepository.create(createAuditLogDto);
    return this.auditLogsRepository.save(auditLog);
  }

  async findAll(_userId: number, userRole: UserRole): Promise<AuditLog[]> {
    // Only admins can view all audit logs
    if (userRole !== UserRole.DOCTOR) {
      throw new ForbiddenException('Access denied');
    }

    return this.auditLogsRepository.find({
      order: { timestamp: 'DESC' },
    });
  }

  async findOne(
    id: number,
    _userId: number,
    userRole: UserRole,
  ): Promise<AuditLog> {
    // Only admins can view specific audit logs
    if (userRole !== UserRole.DOCTOR) {
      throw new ForbiddenException('Access denied');
    }

    const auditLog = await this.auditLogsRepository.findOne({
      where: { id },
    });

    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }

    return auditLog;
  }

  async logUserAction(
    userId: number,
    userRole: UserRole,
    action: AuditAction,
    resourceType: ResourceType,
    resourceId?: string,
    description?: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
    endpoint?: string,
    method?: string,
    statusCode?: number,
    responseTime?: number,
  ): Promise<AuditLog> {
    const auditLog = this.auditLogsRepository.create({
      userId,
      userRole,
      action,
      resourceType,
      resourceId,
      description,
      metadata: metadata as unknown as object,
      ipAddress,
      userAgent,
      endpoint,
      method,
      statusCode,
      responseTime,
    });

    return this.auditLogsRepository.save(auditLog);
  }

  async getLogsByUser(userId: number, userRole: UserRole): Promise<AuditLog[]> {
    // Users can only see their own audit logs
    if (userRole === UserRole.DOCTOR) {
      return this.auditLogsRepository.find({
        where: { userId },
        order: { timestamp: 'DESC' },
      });
    }

    throw new ForbiddenException('Access denied');
  }

  async getLogsByResource(
    resourceType: ResourceType,
    resourceId: string,
    _userId: number,
    userRole: UserRole,
  ): Promise<AuditLog[]> {
    // Only admins can view logs by resource
    if (userRole !== UserRole.DOCTOR) {
      throw new ForbiddenException('Access denied');
    }

    return this.auditLogsRepository.find({
      where: { resourceType, resourceId },
      order: { timestamp: 'DESC' },
    });
  }

  async getLogsByDateRange(
    startDate: Date,
    endDate: Date,
    _userId: number,
    userRole: UserRole,
  ): Promise<AuditLog[]> {
    // Only admins can view logs by date range
    if (userRole !== UserRole.DOCTOR) {
      throw new ForbiddenException('Access denied');
    }

    return this.auditLogsRepository.find({
      where: {
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'DESC' },
    });
  }

  async getLogsByAction(
    action: AuditAction,
    _userId: number,
    userRole: UserRole,
  ): Promise<AuditLog[]> {
    // Only admins can view logs by action
    if (userRole !== UserRole.DOCTOR) {
      throw new ForbiddenException('Access denied');
    }

    return this.auditLogsRepository.find({
      where: { action },
      order: { timestamp: 'DESC' },
    });
  }

  async getRecentLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogsRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
