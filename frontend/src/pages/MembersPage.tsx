import React, { useEffect, useState } from 'react';
import { Search, UserPlus, MoreHorizontal, Shield, Mail, Calendar, Trash2, Edit2 } from 'lucide-react';
import api from '../services/api';
import './MembersPage.css';
import { useAuthStore } from '../store/authStore';

const MembersPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<any[]>([]);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const currentUser = useAuthStore(state => state.user);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('users');
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const { data } = await api.get('roles');
            setRoles(data);
        } catch (err) {
            console.error('Failed to fetch roles');
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleUpdateRole = async (userId: string, role: string) => {
        try {
            await api.patch(`users/${userId}/role`, { role });
            setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
            setEditingUser(null);
        } catch (err) {
            alert('Failed to update role');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleClass = (role: string) => {
        switch (role) {
            case 'admin': return 'role-admin';
            case 'project-manager': return 'role-project-manager';
            default: return 'role-contributor';
        }
    };

    const isAdmin = currentUser?.role === 'admin';

    return (
        <div className="members-page">
            <header className="members-header">
                <h1>Members</h1>
                <div className="search-box" style={{ maxWidth: '300px' }}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search members"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', padding: '0.5rem' }}
                    />
                </div>
            </header>

            <div className="members-table-container">
                <table className="members-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="text-center p-4">Loading members...</td>
                            </tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar-small">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="user-name">{user.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Mail size={14} className="text-subtle" />
                                        <span className="user-email">{user.email}</span>
                                    </div>
                                </td>
                                <td>
                                    {editingUser === user.id ? (
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                            onBlur={() => setEditingUser(null)}
                                            autoFocus
                                            className="role-select"
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="project-manager">Project Manager</option>
                                            <option value="contributor">Contributor</option>
                                            {roles.map(r => (
                                                <option key={r.id} value={r.name}>{r.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Shield size={14} className={getRoleClass(user.role)} />
                                            <span className={`role-badge ${getRoleClass(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={14} className="text-subtle" />
                                        <span className="join-date">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {isAdmin && user.id !== currentUser.id && (
                                        <div className="actions-cell">
                                            <button
                                                className="icon-btn edit-btn"
                                                onClick={() => setEditingUser(user.id)}
                                                title="Change Role"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="icon-btn delete-btn"
                                                onClick={() => handleDeleteUser(user.id)}
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!loading && filteredUsers.length === 0 && (
                    <div className="p-8 text-center" style={{ color: 'var(--text-subtle)' }}>
                        No members found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MembersPage;
