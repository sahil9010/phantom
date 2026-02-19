import React, { useState, useCallback } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Trello, ClipboardList, Settings,
    Users, ChevronDown, ChevronRight, Shield, LogOut
} from 'lucide-react';
import SettingsModal from '../settings/SettingsModal';
import './Sidebar.css';
import { useAuthStore } from '../../store/authStore';
import NotificationCenter from './NotificationCenter';
import GlobalSearch from './GlobalSearch';
import { useProjects } from '../../hooks/useProjects';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { id: projectId } = useParams();
    const { projects } = useProjects();
    const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        logout();
        navigate('/login');
    }, [logout, navigate]);

    const toggleProjects = useCallback(() => setIsProjectsExpanded(prev => !prev), []);
    const toggleCollapse = useCallback(() => setIsCollapsed(prev => !prev), []);

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <Trello size={28} className="logo-icon" />
                    {!isCollapsed && <span>Phantom</span>}
                </div>
                {!isCollapsed && <NotificationCenter />}
                <button className="collapse-btn" onClick={toggleCollapse}>
                    <ChevronRight size={16} className={isCollapsed ? '' : 'rotated'} />
                </button>
            </div>

            <div className="sidebar-content">
                {!isCollapsed && <GlobalSearch />}

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                        <LayoutDashboard size={20} />
                        {!isCollapsed && <span>Dashboard</span>}
                    </NavLink>

                    <div className={`nav-dropdown-toggle ${isProjectsExpanded ? 'expanded' : ''}`} onClick={toggleProjects}>
                        <div className="toggle-content">
                            <ClipboardList size={20} />
                            {!isCollapsed && <span>Projects</span>}
                        </div>
                        {!isCollapsed && <ChevronDown size={14} className="chevron" />}
                    </div>

                    {!isCollapsed && isProjectsExpanded && (
                        <div className="nav-dropdown-content show">
                            <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>
                                <span>All Projects</span>
                            </NavLink>
                            {projects.map(p => (
                                <NavLink
                                    key={p.id}
                                    to={`/projects/${p.id}`}
                                    className={({ isActive }) => isActive ? 'active project-link' : 'project-link'}
                                >
                                    <div className="project-dot" style={{ backgroundColor: p.color || 'var(--primary)' }}></div>
                                    <span>{p.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {user?.role === 'admin' && (
                        <>
                            {!isCollapsed && <div className="nav-section-title">System Info</div>}
                            <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}>
                                <LayoutDashboard size={20} />
                                {!isCollapsed && <span>Admin Dashboard</span>}
                            </NavLink>
                        </>
                    )}

                    <NavLink to="/members" className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}>
                        <Users size={20} />
                        {!isCollapsed && <span>Members</span>}
                    </NavLink>

                    {user?.role === 'admin' && (
                        <NavLink to="/roles" className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}>
                            <Shield size={20} />
                            {!isCollapsed && <span>Roles</span>}
                        </NavLink>
                    )}

                    {user?.isSuperAdmin && (
                        <>
                            {!isCollapsed && <div className="nav-section-title">SaaS Management</div>}
                            <NavLink to="/super-admin" className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}>
                                <Shield size={20} />
                                {!isCollapsed && <span>Super Admin</span>}
                            </NavLink>
                        </>
                    )}

                    {!isCollapsed && <div className="nav-section-title">Settings</div>}

                    <NavLink
                        to={projectId ? `/projects/${projectId}/team` : "/teams"}
                        className={({ isActive }) => (isActive ? 'active' : '') + (!projectId ? ' disabled-nav' : '')}
                        onClick={(e) => {
                            if (!projectId) e.preventDefault();
                            else onClose?.();
                        }}
                    >
                        <Users size={20} />
                        {!isCollapsed && <span>Team Settings</span>}
                    </NavLink>

                    <div className={`nav-item ${isSettingsOpen ? 'active' : ''}`} onClick={() => { setIsSettingsOpen(true); onClose?.(); }}>
                        <Settings size={20} />
                        {!isCollapsed && <span>Preferences</span>}
                    </div>
                </nav>
            </div>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    {!isCollapsed && (
                        <div className="user-info">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={16} />
                    </button>
                )}
            </div>

            <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
            {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
        </aside>
    );
};

export default Sidebar;
