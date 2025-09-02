import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateResultDto {
  @IsNumber()
  @IsNotEmpty()
  labOrderId: number;

  @IsString()
  @IsNotEmpty()
  resultText: string;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsString()
  @IsOptional()
  findings?: string;

  @IsString()
  @IsOptional()
  recommendations?: string;

  @IsOptional()
  attachments?: any;
}
