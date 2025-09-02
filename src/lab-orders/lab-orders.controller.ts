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
import type { IUserRequest } from 'src/types/express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { UpdateLabOrderDto } from './dto/update-lab-order.dto';
import { LabOrder } from './entities/lab-order.entity';
import { LabOrdersService } from './lab-orders.service';

@Controller('lab-orders')
@UseGuards(JwtAuthGuard)
export class LabOrdersController {
  constructor(private readonly labOrdersService: LabOrdersService) {}

  @Post()
  async create(
    @Body() createLabOrderDto: CreateLabOrderDto,
    @Request() req: IUserRequest,
  ): Promise<LabOrder> {
    // Only doctors can create lab orders
    if (req.user?.role !== UserRole.DOCTOR) {
      throw new Error('Only doctors can create lab orders');
    }
    return this.labOrdersService.create(createLabOrderDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req: IUserRequest): Promise<LabOrder[]> {
    return this.labOrdersService.findAll(req.user!.id, req.user!.role);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: IUserRequest,
  ): Promise<LabOrder> {
    return this.labOrdersService.findOne(+id, req.user!.id, req.user!.role);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLabOrderDto: UpdateLabOrderDto,
    @Request() req: IUserRequest,
  ): Promise<LabOrder> {
    return this.labOrdersService.update(
      +id,
      updateLabOrderDto,
      req.user!.id,
      req.user!.role,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: IUserRequest,
  ): Promise<void> {
    return this.labOrdersService.remove(+id, req.user!.id, req.user!.role);
  }

  @Post(':id/assign')
  async assignToLab(
    @Param('id') id: string,
    @Body() body: { labId: number },
    @Request() req: IUserRequest,
  ): Promise<LabOrder> {
    return this.labOrdersService.assignToLab(
      +id,
      body.labId,
      req.user!.id,
      req.user!.role,
    );
  }

  @Get('lab/pending')
  async getPendingOrders(@Request() req: IUserRequest): Promise<LabOrder[]> {
    // Only labs can access pending orders
    if (req.user?.role !== UserRole.LAB) {
      throw new Error('Only labs can access pending orders');
    }
    return this.labOrdersService.getPendingOrders(req.user.id);
  }

  @Get('lab/in-progress')
  async getInProgressOrders(@Request() req: IUserRequest): Promise<LabOrder[]> {
    // Only labs can access in-progress orders
    if (req.user?.role !== UserRole.LAB) {
      throw new Error('Only labs can access in-progress orders');
    }
    return this.labOrdersService.getInProgressOrders(req.user.id);
  }
}
