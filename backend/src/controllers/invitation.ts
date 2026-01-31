import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { sendEmail } from '../services/emailService';

export const sendInvitation = async (req: any, res: Response) => {
    const { email, projectId } = req.body;
    const inviterId = req.user.id;

    if (!email || !projectId) {
        return res.status(400).json({ error: 'Email and project ID are required' });
    }

    try {
        // Check if project exists
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');

        // Upsert invitation
        const invitation = await prisma.invitation.upsert({
            where: {
                email_projectId: { email, projectId }
            },
            update: {
                token,
                status: 'PENDING',
                inviterId
            },
            create: {
                email,
                projectId,
                token,
                status: 'PENDING',
                inviterId
            }
        });

        // Send real email via Nodemailer (Ethereal for testing)
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const joinLink = `${baseUrl}/join/${token}`;
        await sendEmail(
            email,
            `Invitation to join ${project.name}`,
            `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2>You've been invited!</h2>
                <p><strong>${req.user.name}</strong> has invited you to join the project <strong>${project.name}</strong> on Phantom Projects.</p>
                <div style="margin-top: 30px;">
                    <a href="${joinLink}" style="background: #0052cc; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">
                        Accept Invitation & Join Project
                    </a>
                </div>
                <p style="margin-top: 30px; font-size: 0.8rem; color: #666;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    ${joinLink}
                </p>
            </div>
            `
        );

        res.status(201).json({ message: 'Invitation sent successfully', token, link: joinLink });
    } catch (error) {
        console.error('Invitation error:', error);
        res.status(500).json({ error: 'Failed to send invitation' });
    }
};

export const verifyInvitation = async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
        const invitation = await prisma.invitation.findUnique({
            where: { token },
            include: {
                project: { select: { id: true, name: true } },
                inviter: { select: { name: true } }
            }
        });

        if (!invitation || invitation.status !== 'PENDING') {
            return res.status(404).json({ error: 'Invalid or expired invitation' });
        }

        const user = await prisma.user.findUnique({
            where: { email: invitation.email }
        });

        res.json({ ...invitation, userExists: !!user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify invitation' });
    }
};

export const acceptAndRegister = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: 'Name and password are required' });
    }

    try {
        const invitation = await prisma.invitation.findUnique({
            where: { token }
        });

        if (!invitation || invitation.status !== 'PENDING') {
            return res.status(404).json({ error: 'Invalid or expired invitation' });
        }

        // Check if user already exists
        let user = await prisma.user.findUnique({
            where: { email: invitation.email }
        });

        if (user) {
            return res.status(400).json({ error: 'User already exists. Please log in to accept invitation.' });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
            data: {
                email: invitation.email,
                name,
                password: hashedPassword,
                role: 'contributor'
            }
        });

        // Add member
        await prisma.member.create({
            data: {
                userId: user.id,
                projectId: invitation.projectId,
                role: 'contributor'
            }
        });

        // Update invitation status
        await prisma.invitation.update({
            where: { token },
            data: { status: 'ACCEPTED' }
        });

        // Generate token for auto-login
        const jwtToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Account created and joined project',
            projectId: invitation.projectId,
            token: jwtToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Accept and register error:', error);
        res.status(500).json({ error: 'Failed to create account and join' });
    }
};

export const acceptInvitation = async (req: any, res: Response) => {
    const { token } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;

    try {
        const invitation = await prisma.invitation.findUnique({
            where: { token }
        });

        if (!invitation || invitation.status !== 'PENDING') {
            return res.status(404).json({ error: 'Invalid or expired invitation' });
        }

        // Optionally check if email matches (or allow any logged in user)
        // For simplicity, we'll allow the logged in user to accept

        // Add member
        await prisma.member.create({
            data: {
                userId,
                projectId: invitation.projectId,
                role: 'contributor'
            }
        });

        // Update invitation status
        await prisma.invitation.update({
            where: { token },
            data: { status: 'ACCEPTED' }
        });

        res.json({ message: 'Invitation accepted', projectId: invitation.projectId });
    } catch (error) {
        console.error('Accept invitation error:', error);
        res.status(500).json({ error: 'Failed to accept invitation' });
    }
};
