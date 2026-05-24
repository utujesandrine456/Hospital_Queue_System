import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('departments')
export class DepartmentsController {
  constructor(private svc: DepartmentsService) {}

  @Get()
  findAll() { return this.svc.findAll(); }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateDepartmentDto) { return this.svc.create(dto); }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: number, @Body() dto: Partial<CreateDepartmentDto>) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: number) { return this.svc.remove(id); }
}