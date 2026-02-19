import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminDashboard.css'; // Reusing some admin styles
import './SuperAdminDashboard.css';
import { Shield, Users, CreditCard, Globe, Search, Filter } from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    slug: string;
    paymentStatus: 'unpaid' | 'paid' | 'trial' | 'overdue';
    plan: 'free' | 'pro' | 'enterprise';
    memberCount: number;
    projectCount: number;
    createdAt: string;
}

interface SaaSStats {
    totalOrganizations: number;
    paidOrganizations: number;
    totalUsers: number;
}

const SuperAdminDashboard: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [stats, setStats] = useState<SaaSStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [customersRes, statsRes] = await Promise.all([
                    api.get('/super-admin/customers'),
                    api.get('/super-admin/stats')
                ]);
                setCustomers(customersRes.data);
                setStats(statsRes.data);
            } catch (error) {
                console.error('Error fetching Super Admin data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || c.paymentStatus === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'status-paid';
            case 'unpaid': return 'status-unpaid';
            case 'overdue': return 'status-overdue';
            case 'trial': return 'status-trial';
            default: return '';
        }
    };

    if (loading) return <div className="admin-loading">Loading SaaS metrics...</div>;

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div className="header-title">
                    <h1>SaaS Administration</h1>
                    <p>Global customer overview and subscription management.</p>
                </div>
            </header>

            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="stat-icon org-icon">
                        <Globe size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Customers</span>
                        <span className="stat-value">{stats?.totalOrganizations || 0}</span>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon payment-icon">
                        <CreditCard size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Paid Subscriptions</span>
                        <span className="stat-value">{stats?.paidOrganizations || 0}</span>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon users-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Global Users</span>
                        <span className="stat-value">{stats?.totalUsers || 0}</span>
                    </div>
                </div>
            </div>

            <section className="customers-section">
                <div className="section-header">
                    <h2>Customer Directory</h2>
                    <div className="section-actions">
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search organizations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-box">
                            <Filter size={18} />
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">All Statuses</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="overdue">Overdue</option>
                                <option value="trial">Trial</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Organization</th>
                                <th>Slug</th>
                                <th>Plan</th>
                                <th>Status</th>
                                <th>Members</th>
                                <th>Projects</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id}>
                                    <td className="customer-name-cell">
                                        <strong>{customer.name}</strong>
                                    </td>
                                    <td><code>{customer.slug}</code></td>
                                    <td>
                                        <span className={`plan-badge plan-${customer.plan}`}>
                                            {customer.plan.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${getStatusColor(customer.paymentStatus)}`}>
                                            {customer.paymentStatus.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{customer.memberCount}</td>
                                    <td>{customer.projectCount}</td>
                                    <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default SuperAdminDashboard;
