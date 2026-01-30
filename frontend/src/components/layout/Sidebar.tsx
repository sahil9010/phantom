import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Trello, ClipboardList, Settings, Users } from 'lucide-react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
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
                <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>
                    <ClipboardList size={20} />
                    <span>Projects</span>
                </NavLink>
                <NavLink to="/teams" className={({ isActive }) => isActive ? 'active' : ''}>
                    <Users size={20} />
                    <span>Teams</span>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;
