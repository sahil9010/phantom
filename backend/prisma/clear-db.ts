import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
    try {
        console.log('Clearing all data...');
        // Order matters due to foreign keys
        await prisma.comment.deleteMany({});
        await prisma.issue.deleteMany({});
        await prisma.sprint.deleteMany({});
        await prisma.member.deleteMany({});
        await prisma.invitation.deleteMany({});
        await prisma.project.deleteMany({});
        await prisma.user.deleteMany({});

        console.log('All data cleared successfully.');
    } catch (error) {
        console.error('Error clearing data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearData();
