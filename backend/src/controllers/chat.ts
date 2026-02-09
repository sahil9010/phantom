import { Request, Response } from 'express';
import prisma from '../config/db';

interface AuthRequest extends Request {
    user?: any;
}

export const getChatHistory = async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;

    try {
        const messages = await prisma.chatMessage.findMany({
            where: { projectId },
            orderBy: { createdAt: 'asc' },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                }
            },
            take: 50 // Last 50 messages
        });
        res.json(messages);
    } catch (error) {
        console.error('Fetch chat history error:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
};
