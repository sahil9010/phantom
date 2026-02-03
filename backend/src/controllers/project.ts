import { Request, Response } from 'express';
import prisma from '../config/db';
import { emitGlobal } from '../services/socket';
import { createNotification } from './notification';

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
        emitGlobal('projectCreated', project);
        res.status(201).json(project);
    } catch (error) {
        console.error('Project creation error:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;

    try {
        const projects = await prisma.project.findMany({
            where: {
                members: {
                    some: { userId, status: 'ACCEPTED' }
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

export const addMember = async (req: AuthRequest, res: Response) => {
    const { id: projectId } = req.params;
    const { userId, role } = req.body;

    try {
        const project = await prisma.project.findUnique({ where: { id: projectId } });

        const member = await prisma.member.create({
            data: {
                projectId,
                userId,
                role: role || 'contributor',
                status: 'PENDING'
            },
            include: {
                user: { select: { id: true, name: true, email: true, role: true } }
            }
        });

        // Create notification
        await createNotification(userId, {
            type: 'project_invitation',
            title: 'Project Invitation',
            message: `You've been invited to join project: ${project?.name}`,
            projectId,
            link: `/projects/${projectId}`
        });

        res.status(201).json(member);
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ error: 'Failed to add member' });
    }
};

export const acceptInvitation = async (req: AuthRequest, res: Response) => {
    const { id: projectId } = req.params;
    const userId = req.user.id;

    try {
        await prisma.member.update({
            where: { userId_projectId: { userId, projectId } },
            data: { status: 'ACCEPTED' }
        });
        res.json({ message: 'Invitation accepted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to accept invitation' });
    }
};

export const rejectInvitation = async (req: AuthRequest, res: Response) => {
    const { id: projectId } = req.params;
    const userId = req.user.id;

    try {
        await prisma.member.delete({
            where: { userId_projectId: { userId, projectId } }
        });
        res.json({ message: 'Invitation rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject invitation' });
    }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
    const { id: projectId, userId } = req.params;

    try {
        await prisma.member.delete({
            where: {
                userId_projectId: {
                    userId,
                    projectId
                }
            }
        });
        res.status(204).send();
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ error: 'Failed to remove member' });
    }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userRole = req.user.role;

    if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can delete projects' });
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Delete invitations
            await tx.invitation.deleteMany({ where: { projectId: id } });

            // 2. Find issues to delete comments
            const issues = await tx.issue.findMany({ where: { projectId: id }, select: { id: true } });
            const issueIds = issues.map(i => i.id);

            if (issueIds.length > 0) {
                await tx.comment.deleteMany({ where: { issueId: { in: issueIds } } });
            }

            // 3. Delete issues
            await tx.issue.deleteMany({ where: { projectId: id } });

            // 4. Delete sprints
            await tx.sprint.deleteMany({ where: { projectId: id } });

            // 5. Delete members
            await tx.member.deleteMany({ where: { projectId: id } });

            // 6. Delete project
            await tx.project.delete({ where: { id } });
        });

        res.status(204).send();
    } catch (error) {
        console.error('Project deletion error:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
};
export const updateProject = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const project = await prisma.project.update({
            where: { id },
            data: { name, description }
        });
        emitGlobal('projectUpdated', project);
        res.json(project);
    } catch (error) {
        console.error('Project update error:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
};
