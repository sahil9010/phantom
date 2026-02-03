import { Request, Response } from 'express';
import prisma from '../config/db';
import { emitToProject } from '../services/socket';

interface AuthRequest extends Request {
    user?: any;
}

export const createIssue = async (req: AuthRequest, res: Response) => {
    const { title, description, type, priority, status, projectId, sprintId, assigneeId, dueDate, labels } = req.body;
    const reporterId = req.user.id;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get and increment project issue count
            const project = await tx.project.update({
                where: { id: projectId },
                data: { issueCount: { increment: 1 } },
                select: { issueCount: true }
            });

            // 2. Create issue with the new serial number
            const newIssue = await tx.issue.create({
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
                    serialNumber: project.issueCount,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    labels: JSON.stringify(labels || []),
                },
                include: {
                    project: { select: { key: true } },
                    assignee: { select: { id: true, name: true } }
                }
            });
            return newIssue;
        });

        emitToProject(projectId, 'issueCreated', result);
        res.status(201).json(result);
    } catch (error) {
        console.error('Issue creation error:', error);
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
                reporter: { select: { id: true, name: true } },
                project: { select: { key: true } }
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
