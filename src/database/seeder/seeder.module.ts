import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../audit-logs/entities/audit-log.entity';
import { LabOrder } from '../../lab-orders/entities/lab-order.entity';
import { Result } from '../../results/entities/result.entity';
import { User } from '../../users/entities/user.entity';
import { SeedCommand } from './seed.command';
import { SeederController } from './seeder.controller';
import { SeederService } from './seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, LabOrder, Result, AuditLog])],
  controllers: [SeederController],
  providers: [SeederService, SeedCommand],
  exports: [SeederService],
})
export class SeederModule {}
