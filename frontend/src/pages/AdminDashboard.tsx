import React, { useState, useEffect } from 'react';
import { Users, ClipboardList, AlertCircle, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './AdminDashboard.css';

interface Stats {
    users: number;
    projects: number;
    issues: number;
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch admin stats:', err);
                setError('Failed to load system metrics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="admin-dashboard loading">Loading metrics...</div>;
    if (error) return <div className="admin-dashboard error">{error}</div>;

    return (
        <div className="admin-dashboard">
            <header className="page-header">
                <div className="header-text">
                    <h1>System Administration</h1>
                    <p className="subtitle">Global overview and system-wide management tools.</p>
                </div>
            </header>

            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon users">
                        <Users size={24} />
                    </div>
                    <div className="metric-info">
                        <label>Total Users</label>
                        <div className="value">{stats?.users}</div>
                        <Link to="/members" className="metric-link">
                            Manage Users <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon projects">
                        <ClipboardList size={24} />
                    </div>
                    <div className="metric-info">
                        <label>Total Projects</label>
                        <div className="value">{stats?.projects}</div>
                        <Link to="/projects" className="metric-link">
                            View All Projects <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon issues">
                        <AlertCircle size={24} />
                    </div>
                    <div className="metric-info">
                        <label>Total Issues</label>
                        <div className="value">{stats?.issues}</div>
                        <Link to="/issues" className="metric-link disabled">
                            System Reports <Shield size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            <section className="admin-tools">
                <h2>Administrative Tools</h2>
                <div className="tools-grid">
                    <Link to="/roles" className="tool-box">
                        <Shield className="tool-icon" />
                        <div className="tool-text">
                            <h3>Global Roles</h3>
                            <p>Define and manage system-wide permission sets.</p>
                        </div>
                    </Link>
                    {/* Placeholder for future tools */}
                    <div className="tool-box placeholder">
                        <div className="tool-text">
                            <h3>System Logs</h3>
                            <p>Coming Soon: View system-wide activity logs.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;
