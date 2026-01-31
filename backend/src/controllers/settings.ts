import { Request, Response } from 'express';
import prisma from '../config/db';

interface AuthRequest extends Request {
    user?: any;
}

export const getSettings = async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;

    try {
        let settings = await prisma.userSetting.findUnique({
            where: { userId }
        });

        if (!settings) {
            settings = await prisma.userSetting.create({
                data: { userId }
            });
        }

        res.json(settings);
    } catch (error) {
        console.error('Fetch settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const { theme, emailNotifications, compactMode } = req.body;

    try {
        const settings = await prisma.userSetting.upsert({
            where: { userId },
            update: {
                theme,
                emailNotifications,
                compactMode
            },
            create: {
                userId,
                theme,
                emailNotifications,
                compactMode
            }
        });

        res.json(settings);
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
