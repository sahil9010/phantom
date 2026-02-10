import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Layout, Trash2, Edit2, Check } from 'lucide-react';
import api from '../services/api';
import CreateProjectModal from '../components/project/CreateProjectModal';
import './Dashboard.css';
import socket from '../services/socket';

import { useAuthStore } from '../store/authStore';

const Dashboard: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('projects');
            setProjects(data);
        } catch (err) {
            console.error('Failed to fetch projects');
        }
    };

    const handleDeleteProject = async (e: React.MouseEvent, projectId: string, projectName: string) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone and will delete all associated data.`)) {
            try {
                await api.delete(`/projects/${projectId}`);
                fetchProjects();
            } catch (err) {
                console.error('Failed to delete project');
                alert('Failed to delete project');
            }
        }
    };

    const handleUpdateProject = async (e: React.FormEvent, projectId: string) => {
        e.stopPropagation();
        try {
            await api.patch(`/projects/${projectId}`, { name: editName });
            setEditingProjectId(null);
            setEditName('');
        } catch (err) {
            console.error('Failed to update project');
            alert('Failed to update project');
        }
    };

    useEffect(() => {
        fetchProjects();

        socket.on('projectCreated', (newProject: any) => {
            setProjects(prev => {
                if (prev.find(p => p.id === newProject.id)) return prev;
                return [...prev, newProject];
            });
        });

        socket.on('projectUpdated', (updatedProject: any) => {
            setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
        });

        return () => {
            socket.off('projectCreated');
            socket.off('projectUpdated');
        };
    }, []);

    return (
        <div className="dashboard">
            <header className="page-header">
                <div className="header-text">
                    <h1>Active Workspace</h1>
                    <p className="subtitle">Welcome back! Here's what's happening across your projects.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    <span>New Project</span>
                </button>
            </header>

            <section className="stats-overview">
                <div className="stat-card">
                    <label>Total Active Tasks</label>
                    <div className="value">42</div>
                    <div className="trend positive">↑ 12% from last week</div>
                </div>
                <div className="stat-card">
                    <label>Running Projects</label>
                    <div className="value">{projects.length}</div>
                    <div className="trend">Across 2 teams</div>
                </div>
                <div className="stat-card primary">
                    <label>Productivity Score</label>
                    <div className="value">84%</div>
                    <div className="trend">Top 5% in industry</div>
                </div>
            </section>

            <div className="project-grid">
                {projects.map((project: any) => (
                    <div
                        key={project.id}
                        className="project-card"
                        onClick={() => navigate(`/projects/${project.id}`)}
                    >
                        <div className="project-top">
                            <div className="project-icon">
                                <Layout size={24} />
                            </div>
                            {user?.role === 'admin' && (
                                <div className="project-actions">
                                    <button
                                        className="edit-project-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingProjectId(project.id);
                                            setEditName(project.name);
                                        }}
                                        title="Edit Project"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="delete-project-btn"
                                        onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                                        title="Delete Project"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="project-info">
                            {editingProjectId === project.id ? (
                                <div className="edit-project-form" onClick={e => e.stopPropagation()}>
                                    <input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        autoFocus
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleUpdateProject(e, project.id);
                                            if (e.key === 'Escape') setEditingProjectId(null);
                                        }}
                                    />
                                    <button onClick={(e) => handleUpdateProject(e, project.id)}><Check size={16} /></button>
                                </div>
                            ) : (
                                <>
                                    <h3>{project.name}</h3>
                                    <p>{project.key} • Managed project</p>
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {projects.length === 0 && (
                    // ...
                    <div className="empty-state">
                        <p>No projects found. Create your first project to get started!</p>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateProjectModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={fetchProjects}
                />
            )}
        </div>
    );
};

export default Dashboard;
