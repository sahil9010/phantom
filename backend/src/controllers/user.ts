import { Request, Response } from 'express';
import prisma from '../config/db';

interface AuthRequest extends Request {
    user?: any;
}

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
