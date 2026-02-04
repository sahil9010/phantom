import { Request, Response } from 'express';
import prisma from '../config/db';
import { emitToProject } from '../services/socket';
import { createNotification } from './notification';
import { findMentionedUsers } from '../utils/text';

interface AuthRequest extends Request {
    user?: any;
}

export const createComment = async (req: AuthRequest, res: Response) => {
    const { content, issueId, parentId } = req.body;
    const authorId = req.user.id;

    if (!content || !issueId) {
        return res.status(400).json({ error: 'Content and issueId are required' });
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                issueId,
                authorId,
                parentId: parentId || null
            },
            include: {
                author: { select: { id: true, name: true } }
            }
        });

        // We need the projectId to emit to the right room
        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
            include: { project: { select: { id: true, name: true } } }
        });

        if (issue) {
            emitToProject(issue.project.id, 'commentCreated', { ...comment, issueId });

            // 1. Handle Mentions
            const mentionedUsernames = findMentionedUsers(content);
            if (mentionedUsernames.length > 0) {
                // Find users by name (or unique username if you have it)
                const mentionedUsers = await prisma.user.findMany({
                    where: { name: { in: mentionedUsernames } },
                    select: { id: true }
                });

                for (const user of mentionedUsers) {
                    if (user.id !== authorId) {
                        await createNotification(user.id, {
                            type: 'mention',
                            title: 'You were mentioned',
                            message: `${req.user.name} mentioned you in a comment in ${issue.project.name}`,
                            issueId,
                            projectId: issue.project.id,
                            link: `/projects/${issue.project.id}?issue=${issueId}`
                        });
                    }
                }
            }

            // 2. Handle Reply Notification
            if (parentId) {
                const parentComment = await prisma.comment.findUnique({
                    where: { id: parentId },
                    select: { authorId: true }
                });

                if (parentComment && parentComment.authorId !== authorId) {
                    await createNotification(parentComment.authorId, {
                        type: 'comment_reply',
                        title: 'New Reply',
                        message: `${req.user.name} replied to your comment in ${issue.project.name}`,
                        issueId,
                        projectId: issue.project.id,
                        link: `/projects/${issue.project.id}?issue=${issueId}`
                    });
                }
            }
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
