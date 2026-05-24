import { IsString, Length, IsUppercase } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsString()
  @Length(3, 3)
  @IsUppercase()
  acronym: string;
}