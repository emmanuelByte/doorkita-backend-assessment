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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseRoles } from '../utils/roles.decorator';
import { RolesGuard } from '../utils/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseRoles(UserRole.DOCTOR) // Only doctors can create users
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseRoles(UserRole.DOCTOR) // Only doctors can view all users
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseRoles(UserRole.DOCTOR, UserRole.LAB) // Doctors and labs can view specific users
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @UseRoles(UserRole.DOCTOR) // Only doctors can update users
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseRoles(UserRole.DOCTOR) // Only doctors can delete users
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(+id);
  }
}
