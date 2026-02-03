import { Request, Response } from 'express';
import prisma from '../config/db';

interface AuthRequest extends Request {
    user?: any;
}

export const searchUsers = async (req: Request, res: Response) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
        return res.json([]);
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: q } },
                    { email: { contains: q } }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
            },
            take: 10
        });
        res.json(users);
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                avatarUrl: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        res.json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                bio: true,
                avatarUrl: true,
                createdAt: true
            }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    const { name, bio, avatarUrl } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                name,
                bio,
                avatarUrl
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                bio: true,
                avatarUrl: true
            }
        });
        res.json(user);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Simple cascading logic in SQLite/Prisma if not handled by DB
        await prisma.user.delete({
            where: { id }
        });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body; // legacy role string
    const { roleId } = req.body; // new custom role

    try {
        const user = await prisma.user.update({
            where: { id },
            data: {
                role,
                roleId: roleId || null
            },
            select: {
                id: true,
                name: true,
                role: true,
                roleId: true
            }
        });
        res.json(user);
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
};
