import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, Layout, CheckCircle, ArrowRight, Loader, User, Lock } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const JoinProject: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const currentUser = useAuthStore((state) => state.user);

    const [invitation, setInvitation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [joining, setJoining] = useState(false);
    const [success, setSuccess] = useState(false);

    // Registration state
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const { data } = await api.get(`/invitations/${token}`);
                setInvitation(data);
                if (data.userExists && !currentUser) {
                    // User exists but not logged in, maybe redirect to login with redirect param?
                    // For now let them know
                }
            } catch (err: any) {
                setError(err.response?.data?.error || 'Invalid or expired invitation link');
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [token, currentUser]);

    const handleJoinExisting = async () => {
        setJoining(true);
        try {
            const { data } = await api.post(`/invitations/${token}/accept`);
            setSuccess(true);
            setTimeout(() => {
                navigate(`/projects/${data.projectId}`);
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to join project');
        } finally {
            setJoining(false);
        }
    };

    const handleRegisterAndJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setJoining(true);
        try {
            const { data } = await api.post(`/invitations/${token}/register`, { name, password });
            setUser(data.user, data.token);
            setSuccess(true);
            setTimeout(() => {
                navigate(`/projects/${data.projectId}`);
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create account and join');
        } finally {
            setJoining(false);
        }
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Loader className="spin" size={32} />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-app)', padding: '2rem' }}>
            <div className="landscape-modal" style={{ maxWidth: '900px', margin: '0', cursor: 'default', height: 'auto', minHeight: '500px' }}>
                <header className="modal-header premium-header">
                    <div className="header-left">
                        <div className="icon-circle">
                            <UserPlus size={18} />
                        </div>
                        <h2>Project Invitation</h2>
                    </div>
                </header>

                <div className="premium-form" style={{ padding: '3rem 2rem' }}>
                    {error ? (
                        <div style={{ textAlign: 'center', color: '#ef4444' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Invitation Error</h3>
                            <p>{error}</p>
                            <button className="btn-secondary" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>
                                Go to Dashboard
                            </button>
                        </div>
                    ) : success ? (
                        <div style={{ textAlign: 'center', color: '#22c55e' }}>
                            <CheckCircle size={48} style={{ marginBottom: '1.5rem' }} />
                            <h3>Welcome to the Team!</h3>
                            <p>You've successfully joined <strong>{invitation.project.name}</strong>.</p>
                            <p style={{ color: 'var(--text-subtle)', marginTop: '0.5rem' }}>Redirecting to board...</p>
                        </div>
                    ) : (
                        <div className="form-grid">
                            <div className="form-main">
                                <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                                    <strong>{invitation.inviter.name}</strong> has invited you to join:
                                </p>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1.5rem',
                                    background: 'var(--surface-raised)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--border)',
                                    marginBottom: '2rem'
                                }}>
                                    <div className="icon-circle" style={{ width: '50px', height: '50px' }}>
                                        <Layout size={28} />
                                    </div>
                                    <h2 style={{ fontSize: '1.8rem' }}>{invitation.project.name}</h2>
                                </div>
                                <p style={{ color: 'var(--text-subtle)', lineHeight: 1.6 }}>
                                    Join the team and start collaborating on tasks, sprints, and issues in the ultra-fast Phantom Projects environment.
                                </p>
                            </div>

                            <div className="form-side" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '2.5rem' }}>
                                {currentUser ? (
                                    <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <p style={{ marginBottom: '1.5rem' }}>You are logged in as <strong>{currentUser.name}</strong> ({currentUser.email})</p>
                                        <button className="btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={handleJoinExisting} disabled={joining}>
                                            {joining ? 'Joining...' : 'Accept & Join Project'}
                                        </button>
                                    </div>
                                ) : invitation.userExists ? (
                                    <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <p style={{ marginBottom: '1.5rem' }}>An account with <strong>{invitation.email}</strong> already exists.</p>
                                        <button className="btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={() => navigate('/login')}>
                                            Login to Accept
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleRegisterAndJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                        <h3 style={{ marginBottom: '0.5rem' }}>Create Account</h3>
                                        <div className="field-group">
                                            <label><User size={14} /> FULL NAME</label>
                                            <input
                                                type="text"
                                                className="premium-input"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter your name"
                                                required
                                            />
                                        </div>
                                        <div className="field-group">
                                            <label><Lock size={14} /> SET PASSWORD</label>
                                            <input
                                                type="password"
                                                className="premium-input"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Choose a password"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                        <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1rem' }} disabled={joining}>
                                            {joining ? 'setting up...' : 'Setup & Join'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JoinProject;
