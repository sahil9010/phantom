import { Request, Response } from 'express';
import prisma from '../config/db';

interface AuthRequest extends Request {
    user?: any;
}

export const createIssue = async (req: AuthRequest, res: Response) => {
    const { title, description, type, priority, status, projectId, sprintId, assigneeId, dueDate, labels } = req.body;
    const reporterId = req.user.id;

    try {
        const issue = await prisma.issue.create({
            data: {
                title,
                description,
                type,
                priority,
                status,
                projectId,
                sprintId,
                assigneeId,
                reporterId,
                dueDate: dueDate ? new Date(dueDate) : null,
                labels: JSON.stringify(labels || []),
            }
        });
        res.status(201).json(issue);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create issue' });
    }
};

export const updateIssue = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    if (data.labels) data.labels = JSON.stringify(data.labels);

    try {
        const issue = await prisma.issue.update({
            where: { id },
            data
        });
        res.json(issue);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update issue' });
    }
};

export const getProjectIssues = async (req: Request, res: Response) => {
    const { projectId } = req.params;

    try {
        const issues = await prisma.issue.findMany({
            where: { projectId },
            include: {
                assignee: { select: { id: true, name: true } },
                reporter: { select: { id: true, name: true } }
            }
        });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch issues' });
    }
};

export const getIssueDetails = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const issue = await prisma.issue.findUnique({
            where: { id },
            include: {
                assignee: { select: { id: true, name: true } },
                reporter: { select: { id: true, name: true } },
                comments: {
                    include: { author: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        res.json(issue);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch issue details' });
    }
};
