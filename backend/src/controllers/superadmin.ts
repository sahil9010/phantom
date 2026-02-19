import { Request, Response } from 'express';
import prisma from '../config/db';

export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const organizations = await prisma.organization.findMany({
            include: {
                _count: {
                    select: {
                        members: true,
                        projects: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedCustomers = organizations.map(org => ({
            id: org.id,
            name: org.name,
            slug: org.slug,
            paymentStatus: org.paymentStatus,
            plan: org.plan,
            memberCount: org._count.members,
            projectCount: org._count.projects,
            createdAt: org.createdAt,
        }));

        res.json(formattedCustomers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
};

export const getSaaSStats = async (req: Request, res: Response) => {
    try {
        const [totalOrgs, paidOrgs, totalUsers] = await Promise.all([
            prisma.organization.count(),
            prisma.organization.count({ where: { paymentStatus: 'paid' } }),
            prisma.user.count(),
        ]);

        res.json({
            totalOrganizations: totalOrgs,
            paidOrganizations: paidOrgs,
            totalUsers: totalUsers,
        });
    } catch (error) {
        console.error('Error fetching SaaS stats:', error);
        res.status(500).json({ error: 'Failed to fetch global stats' });
    }
};

export const updateCustomerPayment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { paymentStatus, plan } = req.body;

    try {
        const updated = await prisma.organization.update({
            where: { id },
            data: {
                paymentStatus: paymentStatus || undefined,
                plan: plan || undefined
            },
        });
        res.json(updated);
    } catch (error) {
        console.error('Error updating customer payment:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    }
};
