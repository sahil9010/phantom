import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

export const register = async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name },
        });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret');
        res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Unexpected error during registration' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret');
        res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Unexpected error during login' });
    }
};
