import { Request, Response } from 'express';
import prisma from '../config/db';

export const getRoles = async (req: Request, res: Response) => {
    try {
        const roles = await prisma.role.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(roles);
    } catch (error) {
        console.error('Failed to fetch roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
};

export const createRole = async (req: Request, res: Response) => {
    const { name, description, permissions } = req.body;
    try {
        const role = await prisma.role.create({
            data: {
                name,
                description,
                permissions: JSON.stringify(permissions || [])
            }
        });
        res.status(201).json(role);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Role name already exists' });
        }
        res.status(500).json({ error: 'Failed to create role' });
    }
};

export const updateRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, permissions } = req.body;
    try {
        const role = await prisma.role.update({
            where: { id },
            data: {
                name,
                description,
                permissions: JSON.stringify(permissions)
            }
        });
        res.json(role);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update role' });
    }
};

export const deleteRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.role.delete({ where: { id } });
        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete role' });
    }
};
