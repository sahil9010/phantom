import { Request, Response } from 'express';
import prisma from '../config/db';
import { emitToUser } from '../services/socket';

interface AuthRequest extends Request {
    user?: any;
}

export const getNotifications = async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
};

export const createNotification = async (userId: string, data: {
    type: string;
    title: string;
    message: string;
    link?: string;
    projectId?: string;
    issueId?: string;
}) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                ...data
            }
        });

        // Emit via WebSocket
        emitToUser(userId, 'notification', notification);
        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};
