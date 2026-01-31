import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = await prisma.user.create({
            data: {
                email: 'admin@phantom.com',
                password: hashedPassword,
                name: 'System Admin',
                role: 'admin',
                bio: 'Master of the Phantom Projects universe.',
                avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff'
            }
        });

        console.log('Admin user created successfully:');
        console.log('Email: admin@phantom.com');
        console.log('Password: admin123');
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
