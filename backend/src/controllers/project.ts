import { Request, Response } from 'express';
import prisma from '../config/db';

interface AuthRequest extends Request {
    user?: any;
}

export const createProject = async (req: AuthRequest, res: Response) => {
    const { name, key, description } = req.body;
    const userId = req.user.id;

    try {
        const project = await prisma.project.create({
            data: {
                name,
                key,
                description,
                ownerId: userId,
                members: {
                    create: { userId, role: 'admin' }
                }
            }
        });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;

    try {
        const projects = await prisma.project.findMany({
            where: {
                members: {
                    some: { userId }
                }
            }
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

export const getProjectDetails = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                issues: true,
                sprints: true,
                members: {
                    include: { user: { select: { id: true, name: true, email: true, role: true } } }
                }
            }
        });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project details' });
    }
};
