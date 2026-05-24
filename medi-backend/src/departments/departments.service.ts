import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private repo: Repository<Department>,
  ) { }

  findAll() {
    return this.repo.find({ where: { isActive: true } });
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  create(dto: CreateDepartmentDto) {
    const dept = this.repo.create(dto);
    return this.repo.save(dept);
  }

  async update(id: number, dto: Partial<CreateDepartmentDto>) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.update(id, { isActive: false });
    return { message: 'Department deactivated' };
  }
}