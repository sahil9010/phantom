import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Layout } from 'lucide-react';
import api from '../services/api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const { data } = await api.get('/projects');
                setProjects(data);
            } catch (err) {
                console.error('Failed to fetch projects');
            }
        };
        fetchProjects();
    }, []);

    return (
        <div className="dashboard">
            <header className="page-header">
                <h1>Projects</h1>
                <button className="primary-btn">
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
                    </div>
                ))}

                {projects.length === 0 && (
                    <div className="empty-state">
                        <p>No projects found. Create your first project to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
