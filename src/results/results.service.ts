import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabOrderStatus } from '../lab-orders/entities/lab-order.entity';
import { LabOrdersService } from '../lab-orders/lab-orders.service';
import { UserRole } from '../users/entities/user.entity';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { Result, ResultStatus } from './entities/result.entity';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(Result)
    private resultsRepository: Repository<Result>,
    private labOrdersService: LabOrdersService,
  ) {}

  async create(
    createResultDto: CreateResultDto,
    labId: string,
  ): Promise<Result> {
    // Check if lab order exists and is assigned to this lab
    await this.labOrdersService.findOne(
      createResultDto.labOrderId,
      labId,
      UserRole.LAB,
    );

    // Check if result already exists for this lab order
    const existingResult = await this.resultsRepository.findOne({
      where: { labOrderId: createResultDto.labOrderId },
    });

    if (existingResult) {
      throw new ForbiddenException('Result already exists for this lab order');
    }

    const result = this.resultsRepository.create({
      ...createResultDto,
      labId,
      status: ResultStatus.COMPLETED,
      completedAt: new Date(),
    });

    const savedResult = await this.resultsRepository.save(result);

    // Update lab order status to completed
    await this.labOrdersService.updateLabOrderStatus(
      createResultDto.labOrderId,
      LabOrderStatus.COMPLETED,
    );

    return savedResult;
  }

  async findAll(userId: string, userRole: UserRole): Promise<Result[]> {
    switch (userRole) {
      case UserRole.LAB:
        return this.resultsRepository.find({
          where: { labId: userId },
          relations: ['labOrder', 'labOrder.patient', 'labOrder.doctor'],
        });
      case UserRole.DOCTOR:
        return this.resultsRepository.find({
          where: { labOrder: { doctorId: userId } },
          relations: ['labOrder', 'labOrder.patient', 'lab'],
        });
      case UserRole.PATIENT:
        return this.resultsRepository.find({
          where: { labOrder: { patientId: userId } },
          relations: ['labOrder', 'labOrder.doctor', 'lab'],
        });
      default:
        throw new ForbiddenException('Invalid role');
    }
  }

  async findOne(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<Result> {
    const result = await this.resultsRepository.findOne({
      where: { id },
      relations: ['labOrder', 'labOrder.patient', 'labOrder.doctor', 'lab'],
    });

    if (!result) {
      throw new NotFoundException(`Result with ID ${id} not found`);
    }

    // Check if user has access to this result
    switch (userRole) {
      case UserRole.LAB:
        if (result.labId !== userId) {
          throw new ForbiddenException('Access denied');
        }
        break;
      case UserRole.DOCTOR:
        if (result.labOrder.doctorId !== userId) {
          throw new ForbiddenException('Access denied');
        }
        break;
      case UserRole.PATIENT:
        if (result.labOrder.patientId !== userId) {
          throw new ForbiddenException('Access denied');
        }
        break;
      default:
        throw new ForbiddenException('Invalid role');
    }

    return result;
  }

  async update(
    id: string,
    updateResultDto: UpdateResultDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Result> {
    const result = await this.findOne(id, userId, userRole);

    // Only labs can update results
    if (userRole !== UserRole.LAB) {
      throw new ForbiddenException('Only labs can update results');
    }

    Object.assign(result, updateResultDto);
    return this.resultsRepository.save(result);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const result = await this.findOne(id, userId, userRole);

    // Only labs can delete results
    if (userRole !== UserRole.LAB) {
      throw new ForbiddenException('Only labs can delete results');
    }

    await this.resultsRepository.remove(result);
  }

  async getResultsByLabOrder(
    labOrderId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<Result[]> {
    // First check if user has access to the lab order
    await this.labOrdersService.findOne(labOrderId, userId, userRole);

    return this.resultsRepository.find({
      where: { labOrderId },
      relations: ['lab', 'labOrder'],
    });
  }

  async getPendingResults(labId: string): Promise<Result[]> {
    return this.resultsRepository.find({
      where: {
        labId,
        status: ResultStatus.PENDING,
      },
      relations: ['labOrder', 'labOrder.patient', 'labOrder.doctor'],
    });
  }

  async getCompletedResults(labId: string): Promise<Result[]> {
    return this.resultsRepository.find({
      where: {
        labId,
        status: ResultStatus.COMPLETED,
      },
      relations: ['labOrder', 'labOrder.patient', 'labOrder.doctor'],
    });
  }
}
