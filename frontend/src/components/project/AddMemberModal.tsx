import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search, User as UserIcon, Trash2, Shield, Mail, CheckCircle } from 'lucide-react';
import api from '../../services/api';

interface AddMemberModalProps {
    projectId: string;
    existingMembers: any[];
    onClose: () => void;
    onMemberAdded: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ projectId, existingMembers, onClose, onMemberAdded }) => {
    const [activeTab, setActiveTab] = useState<'search' | 'invite'>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (activeTab === 'search' && searchQuery.trim()) {
                handleSearch();
            } else if (activeTab === 'search') {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, activeTab]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/users/search?q=${searchQuery}`);
            const filtered = data.filter((u: any) => !existingMembers.some(m => m.user.id === u.id));
            setSearchResults(filtered);
        } catch (err) {
            console.error('Failed to search users');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (userId: string) => {
        try {
            await api.post(`/projects/${projectId}/members`, { userId, role: 'contributor' });
            onMemberAdded();
            setSearchQuery('');
            setSearchResults(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Failed to add member');
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviting(true);
        setInviteMessage(null);
        setInviteLink('');
        try {
            const { data } = await api.post('invitations', { email: inviteEmail, projectId });
            setInviteMessage({ type: 'success', text: `Invitation sent to ${inviteEmail}!` });
            setInviteLink(data.link);
            setInviteEmail('');
            // Don't auto-hide successful invitation links immediately
        } catch (err: any) {
            setInviteMessage({ type: 'error', text: err.response?.data?.error || 'Failed to send invitation' });
        } finally {
            setInviting(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRemoveMember = async (userId: string) => {
        try {
            await api.delete(`/projects/${projectId}/members/${userId}`);
            onMemberAdded();
        } catch (err) {
            console.error('Failed to remove member');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content landscape-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header premium-header">
                    <div className="header-left">
                        <div className="icon-circle">
                            <UserPlus size={18} />
                        </div>
                        <h2>Manage Project Members</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </header>

                <div className="premium-form" style={{ height: 'calc(100% - 70px)', overflow: 'hidden' }}>
                    <div className="modal-tabs" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', padding: '0 1rem' }}>
                        <button
                            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
                            onClick={() => setActiveTab('search')}
                            style={{
                                padding: '0.75rem 0',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: activeTab === 'search' ? 'var(--primary)' : 'var(--text-subtle)',
                                borderBottom: activeTab === 'search' ? '2px solid var(--primary)' : '2px solid transparent',
                                fontWeight: activeTab === 'search' ? 600 : 400
                            }}
                        >
                            Search Users
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'invite' ? 'active' : ''}`}
                            onClick={() => setActiveTab('invite')}
                            style={{
                                padding: '0.75rem 0',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: activeTab === 'invite' ? 'var(--primary)' : 'var(--text-subtle)',
                                borderBottom: activeTab === 'invite' ? '2px solid var(--primary)' : '2px solid transparent',
                                fontWeight: activeTab === 'invite' ? 600 : 400
                            }}
                        >
                            Invite via Email
                        </button>
                    </div>

                    <div className="form-grid" style={{ height: 'calc(100% - 120px)', overflow: 'hidden' }}>
                        <div className="form-main" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
                            {activeTab === 'search' ? (
                                <>
                                    <div className="field-group">
                                        <label><Search size={14} /> SEARCH EXISTING USERS</label>
                                        <div className="search-box premium-input" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Search size={18} color="var(--text-subtle)" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search by name or email..."
                                                style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', padding: '0.2rem' }}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="search-results-list" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
                                        {loading && <p style={{ textAlign: 'center', color: 'var(--text-subtle)' }}>Searching...</p>}
                                        {!loading && searchResults.length === 0 && searchQuery && (
                                            <p style={{ textAlign: 'center', color: 'var(--text-subtle)' }}>No users found</p>
                                        )}
                                        {searchResults.map(user => (
                                            <div key={user.id} className="search-item" style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '0.75rem 1rem',
                                                background: 'var(--surface-raised)',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div className="icon-circle" style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px' }}>
                                                        <UserIcon size={14} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{user.email}</div>
                                                    </div>
                                                </div>
                                                <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleAddMember(user.id)}>
                                                    Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                                    <div className="field-group">
                                        <label><Mail size={14} /> COWORKER EMAIL</label>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <input
                                                type="email"
                                                className="premium-input"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                placeholder="Enter their email address..."
                                                style={{ flex: 1 }}
                                                required
                                                autoFocus
                                            />
                                            <button
                                                className="btn-primary"
                                                disabled={inviting}
                                                onClick={handleInvite}
                                                style={{ padding: '0 2rem' }}
                                            >
                                                {inviting ? 'Sending...' : 'Invite'}
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.5rem' }}>
                                            They'll receive a secure link to join this project immediately.
                                        </p>
                                    </div>

                                    {inviteMessage && (
                                        <div style={{
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-md)',
                                            background: inviteMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: inviteMessage.type === 'success' ? '#22c55e' : '#ef4444',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            {inviteMessage.type === 'success' && <CheckCircle size={16} />}
                                            {inviteMessage.text}
                                        </div>
                                    )}

                                    {inviteLink && (
                                        <div style={{
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--surface-raised)',
                                            border: '1px solid var(--primary)',
                                            marginTop: '0.5rem'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.5rem' }}>INVITATION LINK (COPY & SEND MANUALLY)</div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={inviteLink}
                                                    style={{
                                                        flex: 1,
                                                        background: 'transparent',
                                                        border: 'none',
                                                        fontSize: '0.85rem',
                                                        color: 'var(--primary)',
                                                        outline: 'none'
                                                    }}
                                                />
                                                <button
                                                    onClick={copyToClipboard}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: copied ? '#22c55e' : 'var(--primary)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {copied ? 'Copied!' : 'Copy'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="form-side" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
                            <div className="field-group" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <label><Shield size={14} /> CURRENT MEMBERS</label>
                                <div className="members-list-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                                    {existingMembers.map(member => (
                                        <div key={member.id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.75rem',
                                            borderBottom: '1px solid var(--border)'
                                        }}>
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.user.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{member.role}</div>
                                            </div>
                                            {member.role !== 'admin' && (
                                                <button className="icon-btn" style={{ color: '#ff4d4f' }} onClick={() => handleRemoveMember(member.userId)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="form-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Done
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default AddMemberModal;
