import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('sandrine@09', 10);

    const user = await prisma.user.upsert({
        where: { username: 'Sandrine' },
        update: {
            passwordHash,
        },
        create: {
            username: 'Sandrine',
            passwordHash,
            role: 'admin',
        },
    });

    console.log('Seed completed. Admin user created:', user.username);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
