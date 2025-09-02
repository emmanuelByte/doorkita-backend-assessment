import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TestType } from '../entities/lab-order.entity';

export class CreateLabOrderDto {
  @IsNumber()
  @IsNotEmpty()
  patientId: number;

  @IsEnum(TestType)
  @IsNotEmpty()
  testType: TestType;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  scheduledDate?: Date;
}
