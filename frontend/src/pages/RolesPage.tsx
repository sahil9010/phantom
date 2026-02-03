import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Edit2, Check, X, Lock } from 'lucide-react';
import api from '../services/api';
import './RolesPage.css';

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string;
}

const RolesPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newRole, setNewRole] = useState({ name: '', description: '' });

    const fetchRoles = async () => {
        try {
            const { data } = await api.get('roles');
            setRoles(data);
        } catch (err) {
            console.error('Failed to fetch roles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('roles', newRole);
            setRoles([...roles, data]);
            setNewRole({ name: '', description: '' });
            setIsCreating(false);
        } catch (err) {
            alert('Failed to create role');
        }
    };

    const handleDeleteRole = async (id: string) => {
        if (!window.confirm('Delete this role? This might affect users assigned to it.')) return;
        try {
            await api.delete(`roles/${id}`);
            setRoles(roles.filter(r => r.id !== id));
        } catch (err) {
            alert('Failed to delete role');
        }
    };

    const systemRoles = ['admin', 'project-manager', 'contributor'];

    return (
        <div className="roles-page">
            <header className="roles-header">
                <div>
                    <h1>System Roles</h1>
                    <p className="text-subtle">Manage custom user roles and permissions</p>
                </div>
                {!isCreating && (
                    <button className="primary-btn" onClick={() => setIsCreating(true)}>
                        <Plus size={18} />
                        Create Custom Role
                    </button>
                )}
            </header>

            <div className="roles-grid">
                {isCreating && (
                    <div className="role-card create-card">
                        <form onSubmit={handleCreateRole}>
                            <input
                                type="text"
                                placeholder="Role Name (e.g. Developer)"
                                value={newRole.name}
                                onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                                required
                                autoFocus
                            />
                            <textarea
                                placeholder="Description"
                                value={newRole.description}
                                onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                            />
                            <div className="card-actions">
                                <button type="button" className="text-btn" onClick={() => setIsCreating(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Save Role</button>
                            </div>
                        </form>
                    </div>
                )}

                {roles.map(role => (
                    <div key={role.id} className="role-card">
                        <div className="role-icon">
                            <Shield size={24} />
                        </div>
                        <div className="role-info">
                            <h3>{role.name}</h3>
                            <p>{role.description || 'No description provided.'}</p>
                        </div>
                        {!systemRoles.includes(role.name.toLowerCase()) ? (
                            <button className="delete-role-btn" onClick={() => handleDeleteRole(role.id)}>
                                <Trash2 size={16} />
                            </button>
                        ) : (
                            <div className="system-tag" title="System roles cannot be deleted">
                                <Lock size={12} />
                                System
                            </div>
                        )}
                    </div>
                ))}

                {loading && <p>Loading roles...</p>}
            </div>
        </div>
    );
};

export default RolesPage;
