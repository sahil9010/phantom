import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X, Trello } from 'lucide-react';
import { useState } from 'react';

const AppLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
                <div style={{ width: '24px' }}></div> {/* Spacer */}
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content" style={{ flex: 1, padding: '2rem', overflowX: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
