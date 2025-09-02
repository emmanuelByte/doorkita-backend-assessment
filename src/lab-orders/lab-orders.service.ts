import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../users/entities/user.entity';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { UpdateLabOrderDto } from './dto/update-lab-order.dto';
import { LabOrder, LabOrderStatus } from './entities/lab-order.entity';

@Injectable()
export class LabOrdersService {
  constructor(
    @InjectRepository(LabOrder)
    private labOrdersRepository: Repository<LabOrder>,
  ) {}

  async create(
    createLabOrderDto: CreateLabOrderDto,
    doctorId: number,
  ): Promise<LabOrder> {
    const labOrder = this.labOrdersRepository.create({
      ...createLabOrderDto,
      doctorId,
      status: LabOrderStatus.PENDING,
    });
    return this.labOrdersRepository.save(labOrder);
  }

  async findAll(userId: number, userRole: UserRole): Promise<LabOrder[]> {
    switch (userRole) {
      case UserRole.DOCTOR:
        return this.labOrdersRepository.find({
          where: { doctorId: userId },
          relations: ['patient', 'lab'],
        });
      case UserRole.PATIENT:
        return this.labOrdersRepository.find({
          where: { patientId: userId },
          relations: ['doctor', 'lab'],
        });
      case UserRole.LAB:
        return this.labOrdersRepository.find({
          where: { labId: userId },
          relations: ['patient', 'doctor'],
        });
      default:
        throw new ForbiddenException('Invalid role');
    }
  }

  async findOne(
    id: number,
    userId: number,
    userRole: UserRole,
  ): Promise<LabOrder> {
    const labOrder = await this.labOrdersRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'lab'],
    });

    if (!labOrder) {
      throw new NotFoundException(`Lab order with ID ${id} not found`);
    }

    // Check if user has access to this lab order
    switch (userRole) {
      case UserRole.DOCTOR:
        if (labOrder.doctorId !== userId) {
          throw new ForbiddenException('Access denied');
        }
        break;
      case UserRole.PATIENT:
        if (labOrder.patientId !== userId) {
          throw new ForbiddenException('Access denied');
        }
        break;
      case UserRole.LAB:
        if (labOrder.labId !== userId) {
          throw new ForbiddenException('Access denied');
        }
        break;
      default:
        throw new ForbiddenException('Invalid role');
    }

    return labOrder;
  }

  async update(
    id: number,
    updateLabOrderDto: UpdateLabOrderDto,
    userId: number,
    userRole: UserRole,
  ): Promise<LabOrder> {
    const labOrder = await this.findOne(id, userId, userRole);

    // Only doctors can update lab orders
    if (userRole !== UserRole.DOCTOR) {
      throw new ForbiddenException('Only doctors can update lab orders');
    }

    Object.assign(labOrder, updateLabOrderDto);
    return this.labOrdersRepository.save(labOrder);
  }

  async remove(id: number, userId: number, userRole: UserRole): Promise<void> {
    const labOrder = await this.findOne(id, userId, userRole);

    // Only doctors can delete lab orders
    if (userRole !== UserRole.DOCTOR) {
      throw new ForbiddenException('Only doctors can delete lab orders');
    }

    await this.labOrdersRepository.remove(labOrder);
  }

  async assignToLab(
    id: number,
    labId: number,
    userId: number,
    userRole: UserRole,
  ): Promise<LabOrder> {
    const labOrder = await this.findOne(id, userId, userRole);

    // Only doctors can assign lab orders to labs
    if (userRole !== UserRole.DOCTOR) {
      throw new ForbiddenException(
        'Only doctors can assign lab orders to labs',
      );
    }

    labOrder.labId = labId;
    labOrder.status = LabOrderStatus.IN_PROGRESS;
    return this.labOrdersRepository.save(labOrder);
  }

  async getPendingOrders(labId: number): Promise<LabOrder[]> {
    return this.labOrdersRepository.find({
      where: {
        labId,
        status: LabOrderStatus.PENDING,
      },
      relations: ['patient', 'doctor'],
    });
  }

  async getInProgressOrders(labId: number): Promise<LabOrder[]> {
    return this.labOrdersRepository.find({
      where: {
        labId,
        status: LabOrderStatus.IN_PROGRESS,
      },
      relations: ['patient', 'doctor'],
    });
  }

  async updateLabOrderStatus(
    id: number,
    status: LabOrderStatus,
  ): Promise<LabOrder> {
    const labOrder = await this.labOrdersRepository.findOne({
      where: { id },
    });

    if (!labOrder) {
      throw new NotFoundException(`Lab order with ID ${id} not found`);
    }

    labOrder.status = status;
    if (status === LabOrderStatus.COMPLETED) {
      labOrder.completedDate = new Date();
    }

    return this.labOrdersRepository.save(labOrder);
  }
}
