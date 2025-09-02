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
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { Result } from './entities/result.entity';
import { ResultsService } from './results.service';

@Controller('results')
@UseGuards(JwtAuthGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post()
  async create(
    @Body() createResultDto: CreateResultDto,
    @Request() req: IUserRequest,
  ): Promise<Result> {
    // Only labs can create results
    if (req.user?.role !== UserRole.LAB) {
      throw new Error('Only labs can create results');
    }
    return this.resultsService.create(createResultDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req: IUserRequest): Promise<Result[]> {
    return this.resultsService.findAll(req.user!.id, req.user!.role);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: IUserRequest,
  ): Promise<Result> {
    return this.resultsService.findOne(+id, req.user!.id, req.user!.role);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateResultDto: UpdateResultDto,
    @Request() req: IUserRequest,
  ): Promise<Result> {
    return this.resultsService.update(
      +id,
      updateResultDto,
      req.user!.id,
      req.user!.role,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: IUserRequest,
  ): Promise<void> {
    return this.resultsService.remove(+id, req.user!.id, req.user!.role);
  }

  @Get('lab-order/:labOrderId')
  async getResultsByLabOrder(
    @Param('labOrderId') labOrderId: string,
    @Request() req: IUserRequest,
  ): Promise<Result[]> {
    return this.resultsService.getResultsByLabOrder(
      +labOrderId,
      req.user!.id,
      req.user!.role,
    );
  }

  @Get('lab/pending')
  async getPendingResults(@Request() req: IUserRequest): Promise<Result[]> {
    // Only labs can access pending results
    if (req.user?.role !== UserRole.LAB) {
      throw new Error('Only labs can access pending results');
    }
    return this.resultsService.getPendingResults(req.user.id);
  }

  @Get('lab/completed')
  async getCompletedResults(@Request() req: IUserRequest): Promise<Result[]> {
    // Only labs can access completed results
    if (req.user?.role !== UserRole.LAB) {
      throw new Error('Only labs can access completed results');
    }
    return this.resultsService.getCompletedResults(req.user.id);
  }
}
