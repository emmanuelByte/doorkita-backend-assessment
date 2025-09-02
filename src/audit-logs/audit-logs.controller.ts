import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import type { IUserRequest } from 'src/types/express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import {
  AuditAction,
  AuditLog,
  ResourceType,
} from './entities/audit-log.entity';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  async create(
    @Body() createAuditLogDto: CreateAuditLogDto,
    @Request() req: IUserRequest,
  ): Promise<AuditLog> {
    // Only doctors can create audit logs
    if (req.user?.role !== UserRole.DOCTOR) {
      throw new Error('Only doctors can create audit logs');
    }
    return this.auditLogsService.create(createAuditLogDto);
  }

  @Get()
  async findAll(@Request() req: IUserRequest): Promise<AuditLog[]> {
    return this.auditLogsService.findAll(req.user!.id, req.user!.role);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: IUserRequest,
  ): Promise<AuditLog> {
    return this.auditLogsService.findOne(+id, req.user!.id, req.user!.role);
  }

  @Get('user/me')
  async getMyLogs(@Request() req: IUserRequest): Promise<AuditLog[]> {
    return this.auditLogsService.getLogsByUser(req.user!.id, req.user!.role);
  }

  @Get('resource/:resourceType/:resourceId')
  async getLogsByResource(
    @Param('resourceType') resourceType: ResourceType,
    @Param('resourceId') resourceId: string,
    @Request() req: IUserRequest,
  ): Promise<AuditLog[]> {
    return this.auditLogsService.getLogsByResource(
      resourceType,
      resourceId,
      req.user!.id,
      req.user!.role,
    );
  }

  @Get('date-range')
  async getLogsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: IUserRequest,
  ): Promise<AuditLog[]> {
    return this.auditLogsService.getLogsByDateRange(
      new Date(startDate),
      new Date(endDate),
      req.user!.id,
      req.user!.role,
    );
  }

  @Get('action/:action')
  async getLogsByAction(
    @Param('action') action: AuditAction,
    @Request() req: IUserRequest,
  ): Promise<AuditLog[]> {
    return this.auditLogsService.getLogsByAction(
      action,
      req.user!.id,
      req.user!.role,
    );
  }

  @Get('recent')
  async getRecentLogs(
    @Query('limit') limit: string,
    @Request() _req: IUserRequest,
  ): Promise<AuditLog[]> {
    return this.auditLogsService.getRecentLogs(limit ? +limit : 100);
  }
}
