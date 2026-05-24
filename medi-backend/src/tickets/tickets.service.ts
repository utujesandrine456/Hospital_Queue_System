import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { Department } from '../departments/entities/department.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
  ) { }

  async create(dto: CreateTicketDto): Promise<Ticket> {
    const dept = await this.deptRepo.findOneBy({ id: dto.departmentId });
    if (!dept) throw new NotFoundException('Department not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await this.ticketRepo.count({
      where: { department: { id: dept.id } },
    });

    const ticketNumber = `${dept.acronym}-${String(count + 1).padStart(3, '0')}`;

    const waitingCount = await this.ticketRepo.count({
      where: { department: { id: dept.id }, status: TicketStatus.WAITING },
    });

    const ticket = this.ticketRepo.create({
      ticketNumber,
      department: dept,
      patientName: dto.patientName,
      patientPhone: dto.patientPhone,
      position: waitingCount + 1,
      status: TicketStatus.WAITING,
    });

    return this.ticketRepo.save(ticket);
  }

  async getQueue(departmentId: number) {
    return this.ticketRepo.find({
      where: {
        department: { id: departmentId },
        status: TicketStatus.WAITING,
      },
      order: { bookedAt: 'ASC' },
    });
  }

  async getTicket(id: number) {
    const ticket = await this.ticketRepo.findOne({
      where: { id },
      relations: { department: true },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async callNext(departmentId: number): Promise<Ticket | null> {
    const serving = await this.ticketRepo.findOne({
      where: { department: { id: departmentId }, status: TicketStatus.SERVING },
    });
    if (serving) {
      serving.status = TicketStatus.DONE;
      serving.servedAt = new Date();
      await this.ticketRepo.save(serving);
    }

    // Get next waiting ticket
    const next = await this.ticketRepo.findOne({
      where: { department: { id: departmentId }, status: TicketStatus.WAITING },
      order: { bookedAt: 'ASC' },
    });

    if (!next) return null;

    next.status = TicketStatus.SERVING;
    next.position = 0;
    await this.ticketRepo.save(next);

    // Recalculate positions for remaining waiting tickets
    await this.recalculatePositions(departmentId);

    return next;
  }

  private async recalculatePositions(departmentId: number) {
    const waiting = await this.ticketRepo.find({
      where: { department: { id: departmentId }, status: TicketStatus.WAITING },
      order: { bookedAt: 'ASC' },
    });
    for (let i = 0; i < waiting.length; i++) {
      waiting[i].position = i + 1;
    }
    await this.ticketRepo.save(waiting);
  }

  // Admin: cancel a ticket
  async cancel(id: number) {
    const ticket = await this.getTicket(id);
    ticket.status = TicketStatus.CANCELLED;
    return this.ticketRepo.save(ticket);
  }

  // Stats for admin dashboard
  async getStats(departmentId: number) {
    const [waiting, serving, done] = await Promise.all([
      this.ticketRepo.count({ where: { department: { id: departmentId }, status: TicketStatus.WAITING } }),
      this.ticketRepo.count({ where: { department: { id: departmentId }, status: TicketStatus.SERVING } }),
      this.ticketRepo.count({ where: { department: { id: departmentId }, status: TicketStatus.DONE } }),
    ]);
    return { waiting, serving, done, total: waiting + serving + done };
  }
}