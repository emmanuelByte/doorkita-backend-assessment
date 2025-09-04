import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { IUserRequest } from 'src/types/express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { UseRoles } from '../utils/roles.decorator';
import { RolesGuard } from '../utils/roles.guard';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { UpdateLabOrderDto } from './dto/update-lab-order.dto';
import { LabOrder } from './entities/lab-order.entity';
import { LabOrdersService } from './lab-orders.service';

@ApiTags('Lab Orders')
@Controller('lab-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LabOrdersController {
  constructor(private readonly labOrdersService: LabOrdersService) {}

  @ApiOperation({
    summary: 'Create a new lab order',
    description: 'Create a new lab order for a patient (Doctor role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    type: CreateLabOrderDto,
    description: 'Lab order creation data',
  })
  @ApiCreatedResponse({
    description: 'Lab order successfully created',
    type: LabOrder,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor role required',
  })
  @Post()
  @UseRoles(UserRole.DOCTOR) // Only doctors can create lab orders
  async create(
    @Body() createLabOrderDto: CreateLabOrderDto,
    @Request() req: IUserRequest,
  ): Promise<LabOrder> {
    return this.labOrdersService.create(createLabOrderDto, req.user!.id);
  }

  @ApiOperation({
    summary: 'Get all lab orders',
    description:
      'Retrieve all lab orders (filtered by user role: Doctor sees all, Lab sees assigned, Patient sees their own)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'Lab orders retrieved successfully',
    type: [LabOrder],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @Get()
  @UseRoles(UserRole.DOCTOR, UserRole.LAB, UserRole.PATIENT) // All roles can view lab orders (filtered by role)
  async findAll(@Request() req: IUserRequest): Promise<LabOrder[]> {
    return this.labOrdersService.findAll(req.user!.id, req.user!.role);
  }

  @ApiOperation({
    summary: 'Get lab order by ID',
    description: 'Retrieve a specific lab order by ID (filtered by user role)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Lab order ID (UUID)',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Lab order retrieved successfully',
    type: LabOrder,
  })
  @ApiNotFoundResponse({
    description: 'Lab order not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @Get(':id')
  @UseRoles(UserRole.DOCTOR, UserRole.LAB, UserRole.PATIENT) // All roles can view specific lab orders (filtered by role)
  async findOne(
    @Param('id') id: string,
    @Request() req: IUserRequest,
  ): Promise<LabOrder> {
    return this.labOrdersService.findOne(id, req.user!.id, req.user!.role);
  }

  @ApiOperation({
    summary: 'Update lab order',
    description:
      'Update a specific lab order by ID (Doctor or Lab role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Lab order ID (UUID)',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateLabOrderDto,
    description: 'Lab order update data',
  })
  @ApiOkResponse({
    description: 'Lab order updated successfully',
    type: LabOrder,
  })
  @ApiNotFoundResponse({
    description: 'Lab order not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor or Lab role required',
  })
  @Patch(':id')
  @UseRoles(UserRole.DOCTOR, UserRole.LAB) // Doctors and labs can update lab orders
  async update(
    @Param('id') id: string,
    @Body() updateLabOrderDto: UpdateLabOrderDto,
    @Request() req: IUserRequest,
  ): Promise<LabOrder> {
    return this.labOrdersService.update(
      id,
      updateLabOrderDto,
      req.user!.id,
      req.user!.role,
    );
  }

  @ApiOperation({
    summary: 'Delete lab order',
    description: 'Delete a specific lab order by ID (Doctor role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Lab order ID (UUID)',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Lab order deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Lab order not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor role required',
  })
  @Delete(':id')
  @UseRoles(UserRole.DOCTOR) // Only doctors can delete lab orders
  async remove(
    @Param('id') id: string,
    @Request() req: IUserRequest,
  ): Promise<void> {
    return this.labOrdersService.remove(id, req.user!.id, req.user!.role);
  }

  @ApiOperation({
    summary: 'Assign lab order to lab',
    description: 'Assign a lab order to a specific lab (Doctor role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Lab order ID (UUID)',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description: 'Lab assignment data',
    schema: {
      type: 'object',
      properties: {
        labId: {
          type: 'string',
          description: 'ID of the lab to assign the order to (UUID)',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
      required: ['labId'],
    },
  })
  @ApiOkResponse({
    description: 'Lab order assigned successfully',
    type: LabOrder,
  })
  @ApiNotFoundResponse({
    description: 'Lab order or lab not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor role required',
  })
  @Post(':id/assign')
  @UseRoles(UserRole.DOCTOR) // Only doctors can assign lab orders to labs
  async assignToLab(
    @Param('id') id: string,
    @Body() body: { labId: string },
    @Request() req: IUserRequest,
  ): Promise<LabOrder> {
    return this.labOrdersService.assignToLab(
      id,
      body.labId,
      req.user!.id,
      req.user!.role,
    );
  }

  @ApiOperation({
    summary: 'Get pending lab orders',
    description:
      'Retrieve all pending lab orders for the authenticated lab (Lab role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'Pending lab orders retrieved successfully',
    type: [LabOrder],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Lab role required',
  })
  @Get('lab/pending')
  @UseRoles(UserRole.LAB) // Only labs can access pending orders
  async getPendingOrders(@Request() req: IUserRequest): Promise<LabOrder[]> {
    return this.labOrdersService.getPendingOrders(req.user!.id);
  }

  @ApiOperation({
    summary: 'Get in-progress lab orders',
    description:
      'Retrieve all in-progress lab orders for the authenticated lab (Lab role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'In-progress lab orders retrieved successfully',
    type: [LabOrder],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Lab role required',
  })
  @Get('lab/in-progress')
  @UseRoles(UserRole.LAB) // Only labs can access in-progress orders
  async getInProgressOrders(@Request() req: IUserRequest): Promise<LabOrder[]> {
    return this.labOrdersService.getInProgressOrders(req.user!.id);
  }
}
