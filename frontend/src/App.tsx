import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';
import ProfilePage from './pages/ProfilePage';
import JoinProject from './pages/JoinProject';
import Register from './pages/Register';
import TeamPage from './pages/TeamPage';
import ProjectsPage from './pages/ProjectsPage';
import MembersPage from './pages/MembersPage';
import RolesPage from './pages/RolesPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    const token = useAuthStore((state) => state.token);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
                <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />

                <Route element={token ? <AppLayout /> : <Navigate to="/login" />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/members" element={<MembersPage />} />
                    <Route path="/roles" element={<RolesPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:id" element={<ProjectBoard />} />
                    <Route path="/projects/:id/team" element={<TeamPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/join/:token" element={<JoinProject />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
