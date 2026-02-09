import React, { useEffect, useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Trello, ClipboardList, Settings, Users, ChevronDown, ChevronRight, Shield, LogOut } from 'lucide-react';
import api from '../../services/api';
import SettingsModal from '../settings/SettingsModal';
import './Sidebar.css';
import { useAuthStore } from '../../store/authStore';
import NotificationCenter from './NotificationCenter';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { id: projectId } = useParams();
    const [projects, setProjects] = useState<any[]>([]);
    const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-logo">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Trello size={28} color="var(--primary)" />
                    <span>Phantom Projects</span>
                </div>
                {!isOpen && <NotificationCenter />}
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

                <NavLink to="/members" className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}>
                    <Users size={20} />
                    <span>Members</span>
                </NavLink>

                {user?.role === 'admin' && (
                    <NavLink to="/roles" className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}>
                        <Shield size={20} />
                        <span>Roles</span>
                    </NavLink>
                )}

                <div className="nav-section-title">Project Settings</div>
                <NavLink
                    to={projectId ? `/projects/${projectId}/team` : "/teams"}
                    className={({ isActive }) => (isActive ? 'active' : '') + (!projectId ? ' disabled-nav' : '')}
                    onClick={(e) => {
                        if (!projectId) {
                            e.preventDefault();
                        } else {
                            onClose?.();
                        }
                    }}
                >
                    <Users size={20} />
                    <span>Team</span>
                </NavLink>
                <div
                    className={`nav-item ${isSettingsOpen ? 'active' : ''}`}
                    onClick={() => {
                        setIsSettingsOpen(true);
                        onClose?.();
                    }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', color: 'var(--text-subtle)', fontWeight: 500 }}
                >
                    <Settings size={20} />
                    <span>Settings</span>
                </div>
                <div style={{ marginTop: 'auto' }}>
                    <div className="sidebar-footer">
                        <div className="user-info">
                            <div className="user-avatar-small">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-details">
                                <span className="user-name">{user?.name}</span>
                                <span className="user-email">{user?.email}</span>
                            </div>
                        </div>
                        <button className="logout-btn" onClick={handleLogout} title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>
            <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
            {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
        </aside>
    );
};

export default Sidebar;
