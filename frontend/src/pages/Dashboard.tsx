import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../services/api';
import CreateProjectModal from '../components/project/CreateProjectModal';
import ProjectCard from '../components/project/ProjectCard';
import './Dashboard.css';
import { useAuthStore } from '../store/authStore';
import { useProjects } from '../hooks/useProjects';

const Dashboard: React.FC = () => {
    const { projects, loading, refresh } = useProjects();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const handleDeleteProject = useCallback(async (e: React.MouseEvent, projectId: string, projectName: string) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${projectName}"?`)) {
            try {
                await api.delete(`/projects/${projectId}`);
                refresh();
            } catch (err) {
                console.error('Failed to delete project');
            }
        }
    }, [refresh]);

    const handleUpdateProject = useCallback(async (e: React.FormEvent, projectId: string) => {
        e.stopPropagation();
        try {
            await api.patch(`/projects/${projectId}`, { name: editName });
            setEditingProjectId(null);
            setEditName('');
            refresh();
        } catch (err) {
            console.error('Failed to update project');
        }
    }, [editName, refresh]);

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
                    <div className="trend">Across {new Set(projects.map(p => p.managerId)).size} units</div>
                </div>
                <div className="stat-card primary">
                    <label>Workspace Health</label>
                    <div className="value">94%</div>
                    <div className="trend">Optimal operation</div>
                </div>
            </section>

            <div className="project-grid">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="project-card skeleton" style={{ height: '200px' }} />
                    ))
                ) : (
                    projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            user={user}
                            isEditing={editingProjectId === project.id}
                            editName={editName}
                            onEdit={(e) => {
                                e.stopPropagation();
                                setEditingProjectId(project.id);
                                setEditName(project.name);
                            }}
                            onDelete={(e) => handleDeleteProject(e, project.id, project.name)}
                            onUpdate={(e) => handleUpdateProject(e, project.id)}
                            onEditNameChange={setEditName}
                            onCancelEdit={() => setEditingProjectId(null)}
                            onClick={() => navigate(`/projects/${project.id}`)}
                        />
                    ))
                )}

                {!loading && projects.length === 0 && (
                    <div className="empty-state">
                        <p>No projects found. Create your first project to get started!</p>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateProjectModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={refresh}
                />
            )}
        </div>
    );
};

export default Dashboard;
