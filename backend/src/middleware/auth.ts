import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;

        // Verify user exists in DB
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return res.status(401).json({ error: 'User no longer exists. Please log in again.' });
        }

        req.user = user; // Store full user object
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

export const protect = authenticate;

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin resource. Access denied.' });
    }
};

export const superAdminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.isSuperAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Super Admin resource. Access denied.' });
    }
};
