import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TestType } from '../entities/lab-order.entity';

export class CreateLabOrderDto {
  @ApiProperty({
    description: 'ID of the patient for the lab order (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Type of test to be performed',
    enum: TestType,
    example: TestType.BLOOD_TEST,
  })
  @IsEnum(TestType)
  @IsNotEmpty()
  testType: TestType;

  @ApiProperty({
    description: 'Additional notes for the lab order',
    example: 'Patient has diabetes, please check glucose levels',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Scheduled date for the lab test',
    example: '2025-09-15T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  scheduledDate?: Date;
}
