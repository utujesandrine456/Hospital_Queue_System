import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_DEPARTMENTS = [
  {
    name: 'Consultation',
    slug: 'consultation',
    acronym: 'CON',
    description: 'See a doctor for diagnosis and treatment',
    avgServiceMinutes: 4,
  },
  {
    name: 'Laboratory',
    slug: 'laboratory',
    acronym: 'LAB',
    description: 'Blood tests, urine tests, and lab work',
    avgServiceMinutes: 5,
  },
  {
    name: 'Pharmacy',
    slug: 'pharmacy',
    acronym: 'PHA',
    description: 'Collect your prescribed medications',
    avgServiceMinutes: 3,
  },
  {
    name: 'Radiology',
    slug: 'radiology',
    acronym: 'RAD',
    description: 'X-rays, MRI, CT scans and imaging',
    avgServiceMinutes: 10,
  },
];

@Injectable()
export class DepartmentsSeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    for (const dept of DEFAULT_DEPARTMENTS) {
      await this.prisma.department.upsert({
        where: { slug: dept.slug },
        update: {},
        create: dept,
      });
    }
  }
}
