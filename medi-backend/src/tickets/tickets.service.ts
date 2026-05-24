import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketStatus } from '../common/ticket-status';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { QueueGateway } from './queue.gateway';

const ticketInclude = { department: true } as const;

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: QueueGateway,
  ) {}

  private emitQueueUpdate(departmentId: number) {
    this.gateway.emitQueueUpdate(departmentId, { departmentId, at: Date.now() });
  }


  private async processDepartmentQueue(departmentId: number): Promise<void> {
    const dept = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });
    const serviceMs = (dept?.avgServiceMinutes ?? 5) * 60 * 1000;
    const now = new Date();
    let changed = false;

    const serving = await this.prisma.ticket.findFirst({
      where: { departmentId, status: TicketStatus.serving },
    });

    if (serving) {
      const startedAt = serving.servingStartedAt ?? serving.bookedAt;
      const elapsed = now.getTime() - new Date(startedAt).getTime();

      if (elapsed >= serviceMs) {
        await this.prisma.ticket.update({
          where: { id: serving.id },
          data: { status: TicketStatus.done, servedAt: now },
        });
        changed = true;
      }
    }

    const stillServing = changed
      ? null
      : await this.prisma.ticket.findFirst({
          where: { departmentId, status: TicketStatus.serving },
        });

    if (!stillServing) {
      const next = await this.prisma.ticket.findFirst({
        where: { departmentId, status: TicketStatus.waiting },
        orderBy: { bookedAt: 'asc' },
      });

      if (next) {
        await this.prisma.ticket.update({
          where: { id: next.id },
          data: {
            status: TicketStatus.serving,
            position: 0,
            servingStartedAt: new Date() as Date,
          },
        });
        changed = true;
      }
    }

    if (changed) {
      await this.recalculatePositions(departmentId);
      this.emitQueueUpdate(departmentId);
    }
  }

  private async processAllActiveDepartments(): Promise<void> {
    const rows = await this.prisma.ticket.findMany({
      where: {
        status: { in: [TicketStatus.waiting, TicketStatus.serving] },
      },
      select: { departmentId: true },
      distinct: ['departmentId'],
    });

    for (const { departmentId } of rows) {
      await this.processDepartmentQueue(departmentId);
    }
  }

  async create(dto: CreateTicketDto) {
    const dept = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!dept) throw new NotFoundException('Department not found');

    const count = await this.prisma.ticket.count({
      where: { departmentId: dept.id },
    });

    const ticketNumber = `${dept.acronym}-${String(count + 1).padStart(3, '0')}`;

    const waitingCount = await this.prisma.ticket.count({
      where: { departmentId: dept.id, status: TicketStatus.waiting },
    });

    const saved = await this.prisma.ticket.create({
      data: {
        ticketNumber,
        departmentId: dept.id,
        patientName: dto.patientName,
        patientPhone: dto.patientPhone,
        position: waitingCount + 1,
        status: TicketStatus.waiting,
      },
      include: ticketInclude,
    });

    await this.processDepartmentQueue(dept.id);
    return this.getTicket(saved.id);
  }

  async getQueue(departmentId: number) {
    await this.processDepartmentQueue(departmentId);
    return this.getActiveByDepartment(departmentId);
  }

  getActiveByDepartment(departmentId: number) {
    return this.prisma.ticket.findMany({
      where: {
        departmentId,
        status: { in: [TicketStatus.waiting, TicketStatus.serving] },
      },
      orderBy: { bookedAt: 'asc' },
      include: ticketInclude,
    });
  }

  async getAllActive() {
    await this.processAllActiveDepartments();
    return this.prisma.ticket.findMany({
      where: {
        status: { in: [TicketStatus.waiting, TicketStatus.serving] },
      },
      orderBy: { bookedAt: 'asc' },
      include: ticketInclude,
    });
  }

  getRecentForAdmin(limit = 200) {
    return this.prisma.ticket.findMany({
      include: ticketInclude,
      orderBy: { bookedAt: 'desc' },
      take: limit,
    });
  }

  async getTicket(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: ticketInclude,
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    await this.processDepartmentQueue(ticket.departmentId);

    const refreshed = await this.prisma.ticket.findUnique({
      where: { id },
      include: ticketInclude,
    });
    if (!refreshed) throw new NotFoundException('Ticket not found');
    return refreshed;
  }

  async callNext(departmentId: number) {
    const serving = await this.prisma.ticket.findFirst({
      where: { departmentId, status: TicketStatus.serving },
    });

    if (serving) {
      await this.prisma.ticket.update({
        where: { id: serving.id },
        data: { status: TicketStatus.done, servedAt: new Date() },
      });
    }

    const next = await this.prisma.ticket.findFirst({
      where: { departmentId, status: TicketStatus.waiting },
      orderBy: { bookedAt: 'asc' },
    });

    if (!next) {
      await this.recalculatePositions(departmentId);
      this.emitQueueUpdate(departmentId);
      return null;
    }

    await this.prisma.ticket.update({
      where: { id: next.id },
      data: {
        status: TicketStatus.serving,
        position: 0,
        servingStartedAt: new Date(),
      },
    });

    await this.recalculatePositions(departmentId);
    this.emitQueueUpdate(departmentId);

    return this.getTicket(next.id);
  }

  private async recalculatePositions(departmentId: number) {
    const waiting = await this.prisma.ticket.findMany({
      where: { departmentId, status: TicketStatus.waiting },
      orderBy: { bookedAt: 'asc' },
    });

    await Promise.all(
      waiting.map((ticket, index) =>
        this.prisma.ticket.update({
          where: { id: ticket.id },
          data: { position: index + 1 },
        }),
      ),
    );
  }

  async cancel(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: ticketInclude,
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const saved = await this.prisma.ticket.update({
      where: { id },
      data: { status: TicketStatus.cancelled },
      include: ticketInclude,
    });
    await this.processDepartmentQueue(ticket.departmentId);
    return saved;
  }

  async getStats(departmentId: number) {
    const [waiting, serving, done] = await Promise.all([
      this.prisma.ticket.count({
        where: { departmentId, status: TicketStatus.waiting },
      }),
      this.prisma.ticket.count({
        where: { departmentId, status: TicketStatus.serving },
      }),
      this.prisma.ticket.count({
        where: { departmentId, status: TicketStatus.done },
      }),
    ]);
    return { waiting, serving, done, total: waiting + serving + done };
  }
}
