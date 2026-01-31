import React, { useEffect, useState } from 'react';
import { Search, UserPlus, MoreHorizontal, Shield, Mail, Calendar } from 'lucide-react';
import api from '../services/api';
import './MembersPage.css';

const MembersPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchUsers();
    }, []);

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
                            <th></th>
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Shield size={14} className={getRoleClass(user.role)} />
                                        <span className={`role-badge ${getRoleClass(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </div>
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
                                    <button className="icon-btn">
                                        <MoreHorizontal size={18} />
                                    </button>
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
