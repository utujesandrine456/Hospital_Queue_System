import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { DepartmentsSeedService } from './departments.seed';

@Module({
  controllers: [DepartmentsController],
  providers: [DepartmentsService, DepartmentsSeedService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
