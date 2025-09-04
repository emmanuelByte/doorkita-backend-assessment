import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserRole } from '../../users/entities/user.entity';
import { UseRoles } from '../../utils/roles.decorator';
import { RolesGuard } from '../../utils/roles.guard';
import { SeederService } from './seeder.service';

@ApiTags('Database Seeder')
@Controller('seeder')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Post('seed')
  @UseRoles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Seed database with sample data',
    description:
      'Populates the database with sample users, lab orders, results, and audit logs. Only accessible by doctors.',
  })
  async seedDatabase(): Promise<{ message: string; timestamp: string }> {
    await this.seederService.seed();
    return {
      message: 'Database seeded successfully with sample data',
      timestamp: new Date().toISOString(),
    };
  }
}
