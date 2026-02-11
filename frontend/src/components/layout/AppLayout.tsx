import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import socket from '../../services/socket';
import { useAuthStore } from '../../store/authStore';
import NotificationCenter from './NotificationCenter';
import './AppLayout.css';

const AppLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        if (user?.id) {
            socket.emit('joinUser', user.id);
        }
    }, [user?.id]);

    return (
        <div className="app-layout">
            {/* Backdrop overlay */}
            {isSidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content">
                {/* Hamburger button */}
                <button
                    className="hamburger-btn"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={20} />
                </button>
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
