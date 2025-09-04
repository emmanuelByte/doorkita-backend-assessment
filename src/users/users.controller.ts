import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseRoles } from '../utils/roles.decorator';
import { RolesGuard } from '../utils/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Create a new user',
    description: 'Create a new user account (Doctor role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    type: CreateUserDto,
    description: 'User creation data',
  })
  @ApiCreatedResponse({
    description: 'User successfully created',
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor role required',
  })
  @Post()
  @UseRoles(UserRole.DOCTOR) // Only doctors can create users
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve all users in the system (Doctor role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    type: [User],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor role required',
  })
  @Get()
  @UseRoles(UserRole.DOCTOR) // Only doctors can view all users
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by ID (Doctor or Lab role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: User,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor or Lab role required',
  })
  @Get(':id')
  @UseRoles(UserRole.DOCTOR, UserRole.LAB) // Doctors and labs can view specific users
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update user',
    description: 'Update a specific user by ID (Doctor role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update data',
  })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: User,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor role required',
  })
  @Patch(':id')
  @UseRoles(UserRole.DOCTOR) // Only doctors can update users
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete a specific user by ID (Doctor role required)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'User deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Doctor role required',
  })
  @Delete(':id')
  @UseRoles(UserRole.DOCTOR) // Only doctors can delete users
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
