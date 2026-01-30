import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout: React.FC = () => {
    return (
        <div className="flex" style={{ minHeight: '100vh' }}>
            <Sidebar />
            <main className="flex-1" style={{ padding: '2rem', overflowX: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
