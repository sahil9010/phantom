import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreHorizontal, Layout } from 'lucide-react';
import api from '../services/api';
import CreateProjectModal from '../components/project/CreateProjectModal';
import './ProjectsPage.css';

const ProjectsPage: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('projects');
            setProjects(data);
        } catch (err) {
            console.error('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.key.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="projects-page">
            <header className="projects-header">
                <h1>Projects</h1>
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    <span>Create project</span>
                </button>
            </header>

            <div className="search-box" style={{ marginBottom: '2rem', maxWidth: '400px' }}>
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Search projects"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', padding: '0.5rem' }}
                />
            </div>

            <div className="projects-list">
                <div className="project-row row-header">
                    <div></div>
                    <div>Name</div>
                    <div>Key</div>
                    <div>Type</div>
                    <div></div>
                </div>

                {loading ? (
                    <div className="p-4 text-center">Loading projects...</div>
                ) : filteredProjects.map(project => (
                    <div
                        key={project.id}
                        className="project-row"
                        onClick={() => navigate(`/projects/${project.id}`)}
                    >
                        <div className="project-avatar-small">
                            {project.key.substring(0, 2)}
                        </div>
                        <div className="p-name">{project.name}</div>
                        <div className="p-key">{project.key}</div>
                        <div className="p-type">Managed project</div>
                        <div>
                            <button className="icon-btn" onClick={(e) => { e.stopPropagation(); }}>
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {!loading && filteredProjects.length === 0 && (
                    <div className="empty-state">
                        <p>No projects found matching your search.</p>
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

export default ProjectsPage;
