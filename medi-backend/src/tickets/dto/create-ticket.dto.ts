import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTicketDto {
  @IsNumber()
  departmentId: number;

  @IsOptional()
  @IsString()
  patientName?: string;

  @IsOptional()
  @IsString()
  patientPhone?: string;

  @IsOptional()
  @IsString()
  patientId?: string;
}