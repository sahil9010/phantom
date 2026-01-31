import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Layout, Trash2 } from 'lucide-react';
import api from '../services/api';
import CreateProjectModal from '../components/project/CreateProjectModal';
import './Dashboard.css';

import { useAuthStore } from '../store/authStore';

const Dashboard: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
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

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <div className="dashboard">
            <header className="page-header">
                <h1>Projects</h1>
                <button className="primary-btn" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    Create Project
                </button>
            </header>

            <div className="project-grid">
                {projects.map((project: any) => (
                    <div
                        key={project.id}
                        className="project-card"
                        onClick={() => navigate(`/projects/${project.id}`)}
                    >
                        <div className="project-icon">
                            <Layout size={24} color="white" />
                        </div>
                        <div className="project-info">
                            <h3>{project.name}</h3>
                            <p>{project.key} • Managed project</p>
                        </div>
                        {user?.role === 'admin' && (
                            <button
                                className="delete-project-btn"
                                onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                                title="Delete Project"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
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
