import { Request, Response } from 'express';
import prisma from '../config/db';

export const getGlobalStats = async (req: Request, res: Response) => {
    try {
        const [userCount, projectCount, issueCount] = await Promise.all([
            prisma.user.count(),
            prisma.project.count(),
            prisma.issue.count()
        ]);

        res.json({
            users: userCount,
            projects: projectCount,
            issues: issueCount
        });
    } catch (error) {
        console.error('Failed to fetch global stats:', error);
        res.status(500).json({ error: 'Failed to fetch global stats' });
    }
};
