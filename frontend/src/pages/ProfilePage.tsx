import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, AlignLeft, Camera, Save, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/users/profile');
                setProfile(data);
                setName(data.name);
                setBio(data.bio || '');
                setAvatarUrl(data.avatarUrl || '');
            } catch (err) {
                console.error('Failed to fetch profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const { data } = await api.put('/users/profile', { name, bio, avatarUrl });
            setProfile(data);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading">Loading profile...</div>;

    return (
        <div className="profile-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <header className="page-header" style={{ marginBottom: '2rem' }}>
                <h1>User Profile</h1>
                <p style={{ color: 'var(--text-subtle)' }}>Manage your personal information and preferences.</p>
            </header>

            <div className="landscape-modal" style={{ position: 'relative', margin: '0', cursor: 'default' }}>
                <header className="modal-header premium-header">
                    <div className="header-left">
                        <div className="icon-circle">
                            <User size={18} />
                        </div>
                        <h2>{profile.name}'s Account</h2>
                    </div>
                </header>

                <form onSubmit={handleSave} className="premium-form">
                    <div className="form-grid">
                        <div className="form-main">
                            <div className="field-group">
                                <label><User size={14} /> DISPLAY NAME</label>
                                <input
                                    type="text"
                                    className="premium-input title-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    required
                                />
                            </div>

                            <div className="field-group">
                                <label><AlignLeft size={14} /> BIO</label>
                                <textarea
                                    className="premium-textarea"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us a bit about yourself..."
                                    style={{ height: '200px' }}
                                />
                            </div>
                        </div>

                        <div className="form-side">
                            <div className="profile-avatar-section" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div className="avatar-preview" style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: 'var(--primary-gradient)',
                                    margin: '0 auto 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    color: 'white',
                                    border: '4px solid white',
                                    boxShadow: 'var(--shadow-md)',
                                    overflow: 'hidden'
                                }}>
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="field-group">
                                    <label><Camera size={14} /> AVATAR URL</label>
                                    <input
                                        type="text"
                                        className="premium-input"
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                        placeholder="Image URL"
                                    />
                                </div>
                            </div>

                            <div className="info-card" style={{
                                padding: '1.5rem',
                                background: 'var(--surface-raised)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Mail size={16} color="var(--text-subtle)" />
                                    <div style={{ fontSize: '0.9rem' }}>
                                        <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem' }}>EMAIL ADDRESS</div>
                                        <div>{profile.email}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Shield size={16} color="var(--text-subtle)" />
                                    <div style={{ fontSize: '0.9rem' }}>
                                        <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem' }}>ROLE</div>
                                        <div style={{ textTransform: 'capitalize' }}>{profile.role}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="form-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem' }}>
                        {message && (
                            <div style={{
                                color: message.type === 'success' ? '#22c55e' : '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem'
                            }}>
                                {message.type === 'success' && <CheckCircle size={16} />}
                                {message.text}
                            </div>
                        )}
                        <button type="submit" className="btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
