import { Request, Response } from 'express';
import prisma from '../config/db';

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
        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
};
