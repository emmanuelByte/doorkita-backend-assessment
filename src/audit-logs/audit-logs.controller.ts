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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { IUserRequest } from 'src/types/express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { UseRoles } from '../utils/roles.decorator';
import { RolesGuard } from '../utils/roles.guard';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import {
  AuditAction,
  AuditLog,
  ResourceType,
} from './entities/audit-log.entity';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @ApiOperation({
    summary: 'Create a new audit log entry',
    description:
      'Create a new audit log entry for compliance tracking (Doctor role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    type: CreateAuditLogDto,
    description: 'Audit log creation data',
  })
  @ApiCreatedResponse({
    description: 'Audit log entry successfully created',
    type: AuditLog,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor role required',
  })
  @Post()
  @UseRoles(UserRole.DOCTOR) // Only doctors can create audit logs
  async create(
    @Body() createAuditLogDto: CreateAuditLogDto,
    @Request() _req: IUserRequest,
  ): Promise<AuditLog> {
    return this.auditLogsService.create(createAuditLogDto);
  }

  @ApiOperation({
    summary: 'Get all audit logs',
    description:
      'Retrieve all audit logs for compliance monitoring (Doctor role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'Audit logs retrieved successfully',
    type: [AuditLog],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor role required',
  })
  @Get()
  @UseRoles(UserRole.DOCTOR) // Only doctors can view all audit logs
  async findAll(@Request() req: IUserRequest): Promise<AuditLog[]> {
    return this.auditLogsService.findAll(req.user!.id, req.user!.role);
  }

  @ApiOperation({
    summary: 'Get audit log by ID',
    description:
      'Retrieve a specific audit log entry by ID (Doctor role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Audit log ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Audit log retrieved successfully',
    type: AuditLog,
  })
  @ApiNotFoundResponse({
    description: 'Audit log not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor role required',
  })
  @Get(':id')
  @UseRoles(UserRole.DOCTOR) // Only doctors can view specific audit logs
  async findOne(
    @Param('id') id: string,
    @Request() req: IUserRequest,
  ): Promise<AuditLog> {
    return this.auditLogsService.findOne(id, req.user!.id, req.user!.role);
  }

  @ApiOperation({
    summary: 'Get my audit logs',
    description:
      'Retrieve audit logs for the authenticated user (Doctor role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'User audit logs retrieved successfully',
    type: [AuditLog],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor role required',
  })
  @Get('user/me')
  @UseRoles(UserRole.DOCTOR) // Only doctors can view their own audit logs
  async getMyLogs(@Request() req: IUserRequest): Promise<AuditLog[]> {
    return this.auditLogsService.getLogsByUser(req.user!.id, req.user!.role);
  }

  @ApiOperation({
    summary: 'Get audit logs by resource',
    description:
      'Retrieve audit logs for a specific resource type and ID (Doctor role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'resourceType',
    description: 'Type of resource',
    enum: ResourceType,
    example: ResourceType.USER,
  })
  @ApiParam({
    name: 'resourceId',
    description: 'ID of the resource',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Resource audit logs retrieved successfully',
    type: [AuditLog],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor role required',
  })
  @Get('resource/:resourceType/:resourceId')
  @UseRoles(UserRole.DOCTOR) // Only doctors can view logs by resource
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

  @ApiOperation({
    summary: 'Get audit logs by date range',
    description:
      'Retrieve audit logs within a specific date range (Doctor role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'startDate',
    description: 'Start date (ISO format)',
    example: '2025-09-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date (ISO format)',
    example: '2025-09-30T23:59:59.999Z',
  })
  @ApiOkResponse({
    description: 'Date range audit logs retrieved successfully',
    type: [AuditLog],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor role required',
  })
  @Get('date-range')
  @UseRoles(UserRole.DOCTOR) // Only doctors can view logs by date range
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

  @ApiOperation({
    summary: 'Get audit logs by action',
    description:
      'Retrieve audit logs for a specific action type (Doctor role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'action',
    description: 'Type of action',
    enum: AuditAction,
    example: AuditAction.CREATE,
  })
  @ApiOkResponse({
    description: 'Action audit logs retrieved successfully',
    type: [AuditLog],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor role required',
  })
  @Get('action/:action')
  @UseRoles(UserRole.DOCTOR) // Only doctors can view logs by action
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

  @ApiOperation({
    summary: 'Get recent audit logs',
    description: 'Retrieve the most recent audit logs (Doctor role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'limit',
    description: 'Number of recent logs to retrieve',
    example: '50',
    required: false,
  })
  @ApiOkResponse({
    description: 'Recent audit logs retrieved successfully',
    type: [AuditLog],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor role required',
  })
  @Get('recent')
  @UseRoles(UserRole.DOCTOR) // Only doctors can view recent logs
  async getRecentLogs(
    @Query('limit') limit: string,
    @Request() _req: IUserRequest,
  ): Promise<AuditLog[]> {
    return this.auditLogsService.getRecentLogs(limit ? +limit : 100);
  }
}
