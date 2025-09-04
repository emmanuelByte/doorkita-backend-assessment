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
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { Result } from './entities/result.entity';
import { ResultsService } from './results.service';

@ApiTags('Lab Results')
@Controller('results')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @ApiOperation({
    summary: 'Create a new lab result',
    description: 'Create a new lab result for a lab order (Lab role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    type: CreateResultDto,
    description: 'Lab result creation data',
  })
  @ApiCreatedResponse({
    description: 'Lab result successfully created',
    type: Result,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Lab role required',
  })
  @Post()
  @UseRoles(UserRole.LAB) // Only labs can create results
  async create(
    @Body() createResultDto: CreateResultDto,
    @Request() req: IUserRequest,
  ): Promise<Result> {
    return this.resultsService.create(createResultDto, req.user!.id);
  }

  @ApiOperation({
    summary: 'Get all lab results',
    description:
      'Retrieve all lab results (filtered by user role: Doctor sees all, Lab sees their own, Patient sees their own)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'Lab results retrieved successfully',
    type: [Result],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @Get()
  @UseRoles(UserRole.DOCTOR, UserRole.LAB, UserRole.PATIENT) // All roles can view results (filtered by role)
  async findAll(@Request() req: IUserRequest): Promise<Result[]> {
    return this.resultsService.findAll(req.user!.id, req.user!.role);
  }

  @ApiOperation({
    summary: 'Get lab result by ID',
    description: 'Retrieve a specific lab result by ID (filtered by user role)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Lab result ID',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Lab result retrieved successfully',
    type: Result,
  })
  @ApiNotFoundResponse({
    description: 'Lab result not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @Get(':id')
  @UseRoles(UserRole.DOCTOR, UserRole.LAB, UserRole.PATIENT) // All roles can view specific results (filtered by role)
  async findOne(
    @Param('id') id: string,
    @Request() req: IUserRequest,
  ): Promise<Result> {
    return this.resultsService.findOne(id, req.user!.id, req.user!.role);
  }

  @ApiOperation({
    summary: 'Update lab result',
    description: 'Update a specific lab result by ID (Lab role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Lab result ID (UUID)',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateResultDto,
    description: 'Lab result update data',
  })
  @ApiOkResponse({
    description: 'Lab result updated successfully',
    type: Result,
  })
  @ApiNotFoundResponse({
    description: 'Lab result not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Lab role required',
  })
  @Patch(':id')
  @UseRoles(UserRole.LAB) // Only labs can update results
  async update(
    @Param('id') id: string,
    @Body() updateResultDto: UpdateResultDto,
    @Request() req: IUserRequest,
  ): Promise<Result> {
    return this.resultsService.update(
      id,
      updateResultDto,
      req.user!.id,
      req.user!.role,
    );
  }

  @ApiOperation({
    summary: 'Delete lab result',
    description: 'Delete a specific lab result by ID (Lab role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Lab result ID (UUID)',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Lab result deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Lab result not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Lab role required',
  })
  @Delete(':id')
  @UseRoles(UserRole.LAB) // Only labs can delete results
  async remove(
    @Param('id') id: string,
    @Request() req: IUserRequest,
  ): Promise<void> {
    return this.resultsService.remove(id, req.user!.id, req.user!.role);
  }

  @ApiOperation({
    summary: 'Get results by lab order',
    description:
      'Retrieve all results for a specific lab order (filtered by user role)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'labOrderId',
    description: 'Lab order ID',
    type: 'string',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Lab results retrieved successfully',
    type: [Result],
  })
  @ApiNotFoundResponse({
    description: 'Lab order not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @Get('lab-order/:labOrderId')
  @UseRoles(UserRole.DOCTOR, UserRole.LAB, UserRole.PATIENT) // All roles can view results by lab order (filtered by role)
  async getResultsByLabOrder(
    @Param('labOrderId') labOrderId: string,
    @Request() req: IUserRequest,
  ): Promise<Result[]> {
    return this.resultsService.getResultsByLabOrder(
      labOrderId,
      req.user!.id,
      req.user!.role,
    );
  }

  @ApiOperation({
    summary: 'Get pending lab results',
    description:
      'Retrieve all pending lab results for the authenticated lab (Lab role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'Pending lab results retrieved successfully',
    type: [Result],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Lab role required',
  })
  @Get('lab/pending')
  @UseRoles(UserRole.LAB) // Only labs can access pending results
  async getPendingResults(@Request() req: IUserRequest): Promise<Result[]> {
    return this.resultsService.getPendingResults(req.user!.id);
  }

  @ApiOperation({
    summary: 'Get completed lab results',
    description:
      'Retrieve all completed lab results for the authenticated lab (Lab role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'Completed lab results retrieved successfully',
    type: [Result],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Lab role required',
  })
  @Get('lab/completed')
  @UseRoles(UserRole.LAB) // Only labs can access completed results
  async getCompletedResults(@Request() req: IUserRequest): Promise<Result[]> {
    return this.resultsService.getCompletedResults(req.user!.id);
  }
}
