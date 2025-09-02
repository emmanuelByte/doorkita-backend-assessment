import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabOrder } from './entities/lab-order.entity';
import { LabOrdersController } from './lab-orders.controller';
import { LabOrdersService } from './lab-orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([LabOrder])],
  controllers: [LabOrdersController],
  providers: [LabOrdersService],
  exports: [LabOrdersService],
})
export class LabOrdersModule {}
