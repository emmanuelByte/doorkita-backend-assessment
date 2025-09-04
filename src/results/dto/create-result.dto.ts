import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateResultDto {
  @ApiProperty({
    description: 'ID of the lab order this result belongs to (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  labOrderId: string;

  @ApiProperty({
    description: 'The main result text/findings',
    example: 'Blood glucose level: 120 mg/dL (Normal range: 70-100 mg/dL)',
  })
  @IsString()
  @IsNotEmpty()
  resultText: string;

  @ApiProperty({
    description: 'Additional comments from the lab technician',
    example: 'Sample collected at 8:00 AM after 12-hour fast',
    required: false,
  })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiProperty({
    description: 'Detailed findings and observations',
    example:
      'Elevated glucose levels detected. Recommend follow-up with endocrinologist.',
    required: false,
  })
  @IsString()
  @IsOptional()
  findings?: string;

  @ApiProperty({
    description: 'Medical recommendations based on results',
    example:
      'Schedule follow-up appointment within 1 week. Monitor blood sugar levels daily.',
    required: false,
  })
  @IsString()
  @IsOptional()
  recommendations?: string;

  @ApiProperty({
    description: 'File attachments (reports, images, etc.)',
    example: ['report.pdf', 'image.jpg'],
    required: false,
  })
  @IsOptional()
  attachments?: any;
}
