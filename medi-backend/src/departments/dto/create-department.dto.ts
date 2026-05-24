import { IsString, Length, IsUppercase, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @Length(3, 3)
  @IsUppercase()
  acronym: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  avgServiceMinutes?: number;
}