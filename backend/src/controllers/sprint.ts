import { Request, Response } from 'express';
import prisma from '../config/db';
import { emitToProject } from '../services/socket';

interface AuthRequest extends Request {
    user?: any;
    params: {
        projectId?: string;
        id?: string;
    };
}

export const createSprint = async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const { name, startDate, endDate } = req.body;

    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    try {
        const sprint = await prisma.sprint.create({
            data: {
                name,
                projectId,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                status: 'planned'
            }
        });

        emitToProject(projectId, 'sprintCreated', sprint);
        res.status(201).json(sprint);
    } catch (error) {
        console.error('Create sprint error:', error);
        res.status(500).json({ error: 'Failed to create sprint' });
    }
};

export const getSprints = async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;

    try {
        const sprints = await prisma.sprint.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { issues: true }
                }
            }
        });
        res.json(sprints);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sprints' });
    }
};

export const updateSprint = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, startDate, endDate, status } = req.body;

    try {
        const currentSprint = await prisma.sprint.findUnique({ where: { id } });
        if (!currentSprint) return res.status(404).json({ error: 'Sprint not found' });

        const projectId = currentSprint.projectId;

        // If starting a sprint, ensure no other active sprints
        if (status === 'active' && currentSprint.status !== 'active') {
            const activeSprint = await prisma.sprint.findFirst({
                where: { projectId, status: 'active' }
            });
            if (activeSprint) {
                return res.status(400).json({ error: 'Only one sprint can be active at a time. Please complete the current active sprint first.' });
            }
        }

        // If completing a sprint, deal with incomplete issues
        if (status === 'completed' && currentSprint.status === 'active') {
            // Move all non-DONE issues back to backlog (sprintId = null)
            await prisma.issue.updateMany({
                where: {
                    sprintId: id,
                    NOT: { status: 'done' }
                },
                data: { sprintId: null }
            });
        }

        const sprint = await prisma.sprint.update({
            where: { id },
            data: {
                name,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                status
            }
        });

        emitToProject(projectId, 'sprintUpdated', sprint);
        res.json(sprint);
    } catch (error) {
        console.error('Update sprint error:', error);
        res.status(500).json({ error: 'Failed to update sprint' });
    }
};

export const deleteSprint = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        // Move issues to backlog (remote sprintId)
        await prisma.issue.updateMany({
            where: { sprintId: id },
            data: { sprintId: null }
        });

        const sprint = await prisma.sprint.delete({
            where: { id }
        });

        emitToProject(sprint.projectId, 'sprintDeleted', id);
        res.status(204).send();
    } catch (error) {
        console.error('Delete sprint error:', error);
        res.status(500).json({ error: 'Failed to delete sprint' });
    }
};
