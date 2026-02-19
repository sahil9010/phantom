import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Organization
    const defaultOrg = await prisma.organization.upsert({
        where: { slug: 'default-org' },
        update: {},
        create: {
            name: 'Default Organization',
            slug: 'default-org',
            paymentStatus: 'paid',
            plan: 'enterprise',
        },
    });

    // Create Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: { isSuperAdmin: true },
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'admin',
            isSuperAdmin: true,
        },
    });

    // Link Admin to Org
    await prisma.organizationMember.upsert({
        where: { userId_organizationId: { userId: admin.id, organizationId: defaultOrg.id } },
        update: {},
        create: {
            userId: admin.id,
            organizationId: defaultOrg.id,
            role: 'owner',
        },
    });

    const pm = await prisma.user.upsert({
        where: { email: 'pm@example.com' },
        update: {},
        create: {
            email: 'pm@example.com',
            name: 'Project Manager',
            password: hashedPassword,
            role: 'project-manager',
        },
    });

    const dev = await prisma.user.upsert({
        where: { email: 'dev@example.com' },
        update: {},
        create: {
            email: 'dev@example.com',
            name: 'Developer User',
            password: hashedPassword,
            role: 'contributor',
        },
    });

    // Create Project
    const project = await prisma.project.create({
        data: {
            name: 'Internal Dashboard',
            key: 'DASH',
            description: 'Main project for internal tools.',
            ownerId: admin.id,
            organizationId: defaultOrg.id,
            members: {
                create: [
                    { userId: admin.id, role: 'admin' },
                    { userId: pm.id, role: 'project-manager' },
                    { userId: dev.id, role: 'contributor' },
                ]
            }
        },
    });

    // Create Sprint
    const sprint = await prisma.sprint.create({
        data: {
            name: 'Sprint 1',
            status: 'active',
            projectId: project.id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        }
    });

    // Create Issues
    await prisma.issue.createMany({
        data: [
            {
                title: 'Initial Setup',
                description: 'Set up the project repository and CI/CD.',
                type: 'task',
                status: 'done',
                priority: 'high',
                projectId: project.id,
                sprintId: sprint.id,
                reporterId: admin.id,
                assigneeId: dev.id,
            },
            {
                title: 'Authentication Module',
                description: 'Implement JWT authentication.',
                type: 'story',
                status: 'in_progress',
                priority: 'critical',
                projectId: project.id,
                sprintId: sprint.id,
                reporterId: pm.id,
                assigneeId: dev.id,
            },
            {
                title: 'Database Schema Crash',
                description: 'Fix the migration error on production.',
                type: 'bug',
                status: 'todo',
                priority: 'high',
                projectId: project.id,
                reporterId: dev.id,
            }
        ]
    });

    console.log('Seed data created successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
