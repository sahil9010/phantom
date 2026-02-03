import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X, Trello } from 'lucide-react';
import { useState, useEffect } from 'react';
import socket from '../../services/socket';
import { useAuthStore } from '../../store/authStore';
import NotificationCenter from './NotificationCenter';

const AppLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        if (user?.id) {
            socket.emit('joinUser', user.id);
        }
    }, [user?.id]);

    return (
        <div className="app-layout" style={{ minHeight: '100vh', display: 'flex' }}>
            {/* Mobile Header */}
            <header className="mobile-header">
                <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
                    <Menu size={24} />
                </button>
                <div className="mobile-logo">
                    <Trello size={24} color="var(--primary)" />
                    <span>Phantom</span>
                </div>
                <NotificationCenter />
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content" style={{ flex: 1, padding: '2rem', overflowX: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
