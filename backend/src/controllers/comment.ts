import { Request, Response } from 'express';
import prisma from '../config/db';
import { emitToProject } from '../services/socket';

interface AuthRequest extends Request {
    user?: any;
}

export const createComment = async (req: AuthRequest, res: Response) => {
    const { content, issueId } = req.body;
    const authorId = req.user.id;

    if (!content || !issueId) {
        return res.status(400).json({ error: 'Content and issueId are required' });
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                issueId,
                authorId
            },
            include: {
                author: { select: { id: true, name: true } }
            }
        });

        // We need the projectId to emit to the right room
        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
            select: { projectId: true }
        });

        if (issue) {
            emitToProject(issue.projectId, 'commentCreated', { ...comment, issueId });
        }

        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
};
export const updateComment = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { content } = req.body;

    try {
        const comment = await prisma.comment.update({
            where: { id },
            data: { content },
            include: { author: { select: { id: true, name: true } } }
        });

        const issue = await prisma.issue.findUnique({
            where: { id: comment.issueId },
            select: { projectId: true }
        });

        if (issue) {
            emitToProject(issue.projectId, 'commentUpdated', comment);
        }

        res.json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update comment' });
    }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const comment = await prisma.comment.delete({
            where: { id }
        });

        const issue = await prisma.issue.findUnique({
            where: { id: comment.issueId },
            select: { projectId: true }
        });

        if (issue) {
            emitToProject(issue.projectId, 'commentDeleted', { id, issueId: comment.issueId });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};
