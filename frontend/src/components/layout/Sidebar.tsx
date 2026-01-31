import React, { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { LayoutDashboard, Trello, ClipboardList, Settings, Users, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import SettingsModal from '../settings/SettingsModal';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    const { id: projectId } = useParams();
    const [projects, setProjects] = useState<any[]>([]);
    const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const { data } = await api.get('projects');
                if (Array.isArray(data)) {
                    setProjects(data);
                }
            } catch (err) {
                console.error('Failed to fetch sidebar projects');
            }
        };
        fetchProjects();
    }, []);

    const toggleProjects = () => setIsProjectsExpanded(!isProjectsExpanded);

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <Trello size={28} color="var(--primary)" />
                <span>Phantom Projects</span>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <div
                    className={`nav-dropdown-toggle ${isProjectsExpanded ? 'expanded' : ''}`}
                    onClick={toggleProjects}
                >
                    <div className="toggle-content">
                        <ClipboardList size={20} />
                        <span>Projects</span>
                    </div>
                    <ChevronDown size={16} className="chevron" />
                </div>

                <div className={`nav-dropdown-content ${isProjectsExpanded ? 'show' : ''}`}>
                    <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span>View All Projects</span>
                    </NavLink>
                    {projects.map(p => (
                        <NavLink
                            key={p.id}
                            to={`/projects/${p.id}`}
                            className={({ isActive }) => isActive ? 'active project-link' : 'project-link'}
                        >
                            <Trello size={16} />
                            <span>{p.name}</span>
                        </NavLink>
                    ))}
                </div>

                <NavLink to="/members" className={({ isActive }) => isActive ? 'active' : ''}>
                    <Users size={20} />
                    <span>Members</span>
                </NavLink>

                <div className="nav-section-title">Project Settings</div>
                <NavLink
                    to={projectId ? `/projects/${projectId}/team` : "/teams"}
                    className={({ isActive }) => (isActive ? 'active' : '') + (!projectId ? ' disabled-nav' : '')}
                    onClick={(e) => !projectId && e.preventDefault()}
                >
                    <Users size={20} />
                    <span>Team</span>
                </NavLink>
                <div
                    className={`nav-item ${isSettingsOpen ? 'active' : ''}`}
                    onClick={() => setIsSettingsOpen(true)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', color: 'var(--text-subtle)', fontWeight: 500 }}
                >
                    <Settings size={20} />
                    <span>Settings</span>
                </div>
                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                        <Users size={20} />
                        <span>Profile</span>
                    </NavLink>
                </div>
            </nav>
            {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
        </aside>
    );
};

export default Sidebar;
