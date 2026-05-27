import { Injectable, NotFoundException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TicketStatus } from '../common/ticket-status';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { QueueGateway } from './queue.gateway';

const ticketInclude = { department: true } as const;
/** How long #1 in queue waits before auto-call when the counter is free */
const AUTO_CALL_DELAY_MS = 4_000;

function serviceDurationMs(avgServiceMinutes: number | null | undefined): number {
  return (avgServiceMinutes ?? 5) * 60 * 1000;
}

@Injectable()
export class TicketsService implements OnModuleInit, OnModuleDestroy {
  private tickInterval: NodeJS.Timeout;

  onModuleInit() {
    this.tickInterval = setInterval(() => {
      this.processAllActiveDepartments().catch(console.error);
    }, 5000);
  }

  onModuleDestroy() {
    clearInterval(this.tickInterval);
  }
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: QueueGateway,
  ) { }

  private emitQueueUpdate(departmentId: number) {
    this.gateway.emitQueueUpdate(departmentId, { departmentId, at: Date.now() });
  }

  private async enforceSingleServingPerDepartment(departmentId: number): Promise<boolean> {
    const servingList = await this.prisma.ticket.findMany({
      where: { departmentId, status: TicketStatus.serving },
      orderBy: [{ servingStartedAt: 'asc' }, { bookedAt: 'asc' }],
    });

    if (servingList.length <= 1) return false;

    const [, ...extras] = servingList;
    for (const extra of extras) {
      await this.prisma.ticket.update({
        where: { id: extra.id },
        data: { status: TicketStatus.waiting, servingStartedAt: null, serveEligibleAt: null },
      });
    }
    await this.recalculatePositions(departmentId);
    return true;
  }

  private async activateNextDeferredTicket(patientId: string | null): Promise<void> {
    if (!patientId) return;
    const nextDeferred = await this.prisma.ticket.findFirst({
      where: { patientId, deferred: true, status: TicketStatus.waiting },
      orderBy: { bookedAt: 'asc' },
    });
    if (nextDeferred) {
      await this.prisma.ticket.update({
        where: { id: nextDeferred.id },
        data: { deferred: false, bookedAt: new Date() },
      });
      await this.recalculatePositions(nextDeferred.departmentId);
      this.emitQueueUpdate(nextDeferred.departmentId);
      await this.processDepartmentQueue(nextDeferred.departmentId);
    }
  }

  private async moveToEndOfQueue(ticketId: number, departmentId: number): Promise<void> {
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.waiting,
        servingStartedAt: null,
        serveEligibleAt: null,
        bookedAt: new Date(),
      },
    });
    await this.recalculatePositions(departmentId);
  }

  private async isPatientServingElsewhere(
    patientId: string | null,
    departmentId: number,
  ): Promise<boolean> {
    if (!patientId) return false;
    const other = await this.prisma.ticket.findFirst({
      where: {
        patientId,
        status: TicketStatus.serving,
        departmentId: { not: departmentId },
      },
    });
    return Boolean(other);
  }

  private async processDepartmentQueue(departmentId: number): Promise<void> {
    const now = new Date();
    let changed = await this.enforceSingleServingPerDepartment(departmentId);

    const dept = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });
    const serviceMs = serviceDurationMs(dept?.avgServiceMinutes);

    const serving = await this.prisma.ticket.findFirst({
      where: { departmentId, status: TicketStatus.serving },
      orderBy: { servingStartedAt: 'asc' },
    });

    if (serving) {
      const startedAt = serving.servingStartedAt ?? serving.bookedAt;
      const elapsed = now.getTime() - new Date(startedAt).getTime();

      if (elapsed >= serviceMs) {
        await this.prisma.ticket.update({
          where: { id: serving.id },
          data: { status: TicketStatus.done, servedAt: now, serveEligibleAt: null },
        });
        await this.activateNextDeferredTicket(serving.patientId);
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
        where: { departmentId, status: TicketStatus.waiting, deferred: false },
        orderBy: [{ position: 'asc' }, { bookedAt: 'asc' }],
      });

      if (next) {
        const blocked = await this.isPatientServingElsewhere(
          next.patientId,
          departmentId,
        );

        if (blocked) {
          if (next.serveEligibleAt) {
            await this.prisma.ticket.update({
              where: { id: next.id },
              data: { serveEligibleAt: null },
            });
            changed = true;
          }
        } else if (!next.serveEligibleAt) {
          await this.prisma.ticket.update({
            where: { id: next.id },
            data: { serveEligibleAt: now },
          });
          changed = true;
        } else {
          const waitMs = now.getTime() - new Date(next.serveEligibleAt).getTime();
          if (waitMs >= AUTO_CALL_DELAY_MS) {
            await this.prisma.ticket.update({
              where: { id: next.id },
              data: {
                status: TicketStatus.serving,
                position: 0,
                servingStartedAt: now,
                serveEligibleAt: null,
              },
            });
            changed = true;
          }
        }
      }
    } else {
      // Counter busy — reset call timer for everyone waiting behind
      const waiting = await this.prisma.ticket.findMany({
        where: { departmentId, status: TicketStatus.waiting, deferred: false, serveEligibleAt: { not: null } },
      });
      if (waiting.length > 0) {
        await this.prisma.ticket.updateMany({
          where: { departmentId, status: TicketStatus.waiting },
          data: { serveEligibleAt: null },
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

  /** Raw queue snapshot for debugging duplicate-serving issues */
  async getQueueIntegrity(departmentId: number) {
    const dept = await this.prisma.department.findUnique({ where: { id: departmentId } });
    if (!dept) throw new NotFoundException('Department not found');

    await this.processDepartmentQueue(departmentId);

    const tickets = await this.prisma.ticket.findMany({
      where: {
        departmentId,
        status: { in: [TicketStatus.waiting, TicketStatus.serving] },
      },
      orderBy: [{ status: 'asc' }, { position: 'asc' }, { bookedAt: 'asc' }],
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        position: true,
        patientName: true,
        patientId: true,
        bookedAt: true,
        serveEligibleAt: true,
        servingStartedAt: true,
      },
    });

    const serving = tickets.filter(t => t.status === TicketStatus.serving);
    const waiting = tickets.filter(t => t.status === TicketStatus.waiting);

    return {
      department: { id: dept.id, name: dept.name, slug: dept.slug },
      rule: 'At most ONE ticket with status=serving per department',
      servingCount: serving.length,
      waitingCount: waiting.length,
      isValid: serving.length <= 1,
      serving,
      waiting,
    };
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

    const existingActive = dto.patientId ? await this.prisma.ticket.findFirst({
      where: {
        patientId: dto.patientId,
        status: { in: [TicketStatus.waiting, TicketStatus.serving] }
      }
    }) : null;

    const saved = await this.prisma.ticket.create({
      data: {
        ticketNumber,
        departmentId: dept.id,
        patientName: dto.patientName,
        patientPhone: dto.patientPhone,
        patientId: dto.patientId ?? null,
        position: waitingCount + 1,
        deferred: Boolean(existingActive),
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

  /** Returns all active tickets belonging to a patient session */
  async getTicketsByPatient(patientId: string) {
    await this.processAllActiveDepartments();
    return this.prisma.ticket.findMany({
      where: {
        patientId,
        status: { in: [TicketStatus.waiting, TicketStatus.serving] },
      },
      orderBy: { bookedAt: 'asc' },
      include: ticketInclude,
    });
  }

  async callNext(departmentId: number) {
    await this.enforceSingleServingPerDepartment(departmentId);

    const serving = await this.prisma.ticket.findFirst({
      where: { departmentId, status: TicketStatus.serving },
    });

    if (serving) {
      await this.prisma.ticket.update({
        where: { id: serving.id },
        data: { status: TicketStatus.done, servedAt: new Date(), serveEligibleAt: null },
      });
      await this.activateNextDeferredTicket(serving.patientId);
    }

    const next = await this.prisma.ticket.findFirst({
      where: { departmentId, status: TicketStatus.waiting, deferred: false },
      orderBy: [{ position: 'asc' }, { bookedAt: 'asc' }],
    });

    if (!next) {
      await this.recalculatePositions(departmentId);
      this.emitQueueUpdate(departmentId);
      return null;
    }

    const blocked = await this.isPatientServingElsewhere(next.patientId, departmentId);
    if (blocked) {
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
        serveEligibleAt: null,
      },
    });

    await this.recalculatePositions(departmentId);
    this.emitQueueUpdate(departmentId);

    return this.getTicket(next.id);
  }

  private async recalculatePositions(departmentId: number) {
    const waiting = await this.prisma.ticket.findMany({
      where: { departmentId, status: TicketStatus.waiting, deferred: false },
      orderBy: [{ position: 'asc' }, { bookedAt: 'asc' }],
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
      data: { status: TicketStatus.cancelled, serveEligibleAt: null },
      include: ticketInclude,
    });
    await this.activateNextDeferredTicket(ticket.patientId);
    await this.processDepartmentQueue(ticket.departmentId);
    return saved;
  }

  async chooseServingTicket(patientId: string, chosenTicketId: number) {
    const chosen = await this.prisma.ticket.findFirst({
      where: {
        id: chosenTicketId,
        patientId,
        status: { in: [TicketStatus.waiting, TicketStatus.serving] },
      },
      include: ticketInclude,
    });
    if (!chosen) throw new NotFoundException('Ticket not found for this patient');

    if (chosen.status !== TicketStatus.serving) {
      await this.prisma.ticket.update({
        where: { id: chosen.id },
        data: {
          status: TicketStatus.serving,
          position: 0,
          servingStartedAt: new Date(),
          serveEligibleAt: null,
        },
      });
    }

    const conflicts = await this.prisma.ticket.findMany({
      where: {
        patientId,
        status: TicketStatus.serving,
        id: { not: chosen.id },
      },
      include: ticketInclude,
    });

    const touchedDepartments = new Set<number>([chosen.departmentId]);
    for (const conflict of conflicts) {
      await this.moveToEndOfQueue(conflict.id, conflict.departmentId);
      touchedDepartments.add(conflict.departmentId);
    }

    for (const deptId of touchedDepartments) {
      await this.enforceSingleServingPerDepartment(deptId);
      await this.recalculatePositions(deptId);
      this.emitQueueUpdate(deptId);
    }

    return this.getTicketsByPatient(patientId);
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

  async getOverallStats() {
    const [totalTickets, totalServed, activePatients] = await Promise.all([
      this.prisma.ticket.count(),
      this.prisma.ticket.count({ where: { status: TicketStatus.done } }),
      this.prisma.ticket.count({
        where: { status: { in: [TicketStatus.waiting, TicketStatus.serving] } },
      }),
    ]);
    return { totalTickets, totalServed, activePatients };
  }
}
