import React, { useState } from 'react';
import { X, Layout, Key, AlignLeft } from 'lucide-react';
import api from '../../services/api';

interface CreateProjectModalProps {
    onClose: () => void;
    onCreated: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !key) return;

        setLoading(true);
        setError(null);
        try {
            await api.post('/projects', { name, key, description });
            onCreated();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create project. Check if the key is unique.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content landscape-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header premium-header">
                    <div className="header-left">
                        <div className="icon-circle">
                            <Layout size={18} />
                        </div>
                        <h2>Create New Project</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </header>

                <form onSubmit={handleSubmit} className="premium-form">
                    <div className="form-grid">
                        <div className="form-main">
                            <div className="field-group">
                                <label><AlignLeft size={14} /> PROJECT NAME</label>
                                <input
                                    type="text"
                                    className="premium-input title-input"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (!key) setKey(e.target.value.slice(0, 3).toUpperCase());
                                    }}
                                    placeholder="Enter project name..."
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="field-group">
                                <label><AlignLeft size={14} /> DESCRIPTION</label>
                                <textarea
                                    className="premium-textarea"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What is this project about?"
                                />
                            </div>
                        </div>

                        <div className="form-side">
                            <div className="field-group">
                                <label><Key size={14} /> PROJECT KEY</label>
                                <input
                                    type="text"
                                    className="premium-input"
                                    value={key}
                                    onChange={(e) => setKey(e.target.value.toUpperCase())}
                                    placeholder="e.g. PRJ"
                                    required
                                    maxLength={10}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.4rem' }}>
                                    The key is used as a prefix for all issues in this project.
                                </p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem', padding: '0 1rem' }}>
                            {error}
                        </div>
                    )}

                    <footer className="form-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;
