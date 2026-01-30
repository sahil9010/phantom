import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';

function App() {
    const token = useAuthStore((state) => state.token);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />

                <Route element={token ? <AppLayout /> : <Navigate to="/login" />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/projects" element={<div>Projects List</div>} />
                    <Route path="/projects/:id" element={<ProjectBoard />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
