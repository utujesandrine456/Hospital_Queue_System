import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const departments = await prisma.department.findMany({ orderBy: { id: 'asc' } });

  console.log('\n=== MediQueue — real PostgreSQL data ===\n');

  for (const dept of departments) {
    const active = await prisma.ticket.findMany({
      where: {
        departmentId: dept.id,
        status: { in: ['waiting', 'serving'] },
      },
      orderBy: [{ status: 'asc' }, { position: 'asc' }, { bookedAt: 'asc' }],
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        position: true,
        patientName: true,
        patientId: true,
        serveEligibleAt: true,
        servingStartedAt: true,
        bookedAt: true,
      },
    });

    const serving = active.filter((t) => t.status === 'serving');
    const waiting = active.filter((t) => t.status === 'waiting');

    console.log(`Department: ${dept.name} (${dept.slug}, id=${dept.id})`);
    console.log(`  serving count: ${serving.length} ${serving.length > 1 ? '← INVALID (should be 0 or 1)' : '← OK'}`);
    console.log(`  waiting count: ${waiting.length}`);

    if (serving.length) {
      console.log('  NOW SERVING (DB rows):');
      for (const t of serving) {
        console.log(
          `    - ${t.ticketNumber} | ${t.patientName ?? 'Anonymous'} | id=${t.id} | started=${t.servingStartedAt?.toISOString() ?? 'n/a'}`,
        );
      }
    }

    if (waiting.length) {
      console.log('  WAITING:');
      for (const t of waiting) {
        console.log(
          `    - ${t.ticketNumber} | pos #${t.position} | ${t.patientName ?? 'Anonymous'} | eligible=${t.serveEligibleAt?.toISOString() ?? 'n/a'}`,
        );
      }
    }

    if (!active.length) console.log('  (no active tickets)');

    const history = await prisma.ticket.findMany({
      where: { departmentId: dept.id, status: { in: ['done', 'cancelled'] } },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        patientName: true,
        servedAt: true,
      },
    });
    if (history.length) {
      console.log('  COMPLETED / CANCELLED:');
      for (const t of history) {
        console.log(`    - ${t.ticketNumber} | ${t.status} | ${t.patientName ?? 'Anonymous'}`);
      }
    }

    console.log('');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
