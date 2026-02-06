import React, { useState } from 'react';
import { X, Image as ImageIcon, AlignLeft, Type, Flag, Plus } from 'lucide-react';
import api from '../../services/api';

interface CreateIssueModalProps {
    projectId: string;
    status: string;
    members: any[];
    sprints: any[];
    onClose: () => void;
    onCreated: (issue: any) => void;
}

const CreateIssueModal: React.FC<CreateIssueModalProps> = ({ projectId, status, members, sprints, onClose, onCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [priority, setPriority] = useState('medium');
    const [assigneeId, setAssigneeId] = useState('');
    // Default to active sprint if available
    const activeSprint = sprints.find((s: any) => s.status === 'active');
    const [sprintId, setSprintId] = useState(activeSprint ? activeSprint.id : '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !sprintId) return;

        setLoading(true);
        try {
            const { data } = await api.post('issues', {
                title,
                description,
                projectId,
                status,
                type: 'task',
                priority,
                assigneeId: assigneeId || null,
                sprintId,
                attachments: JSON.stringify(imageUrl ? [imageUrl] : [])
            });
            onCreated(data);
            onClose();
        } catch (err) {
            console.error('Failed to create issue');
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
                            <Plus size={18} color="white" />
                        </div>
                        <h2>Create New Task</h2>
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Close modal">
                        <X size={20} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="premium-form">
                    <div className="form-grid">
                        <div className="form-main">
                            <div className="field-group">
                                <label><Type size={14} /> Title</label>
                                <input
                                    type="text"
                                    className="premium-input title-input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Summary of the task..."
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="field-group">
                                <label><AlignLeft size={14} /> Description</label>
                                <textarea
                                    className="premium-textarea"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add details, acceptance criteria, etc..."
                                />
                            </div>
                        </div>

                        <div className="form-side">
                            <div className="field-group">
                                <label><ImageIcon size={14} /> Image Reference</label>
                                <div className="image-preview-box">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="preview" />
                                    ) : (
                                        <div className="placeholder-icon">
                                            <ImageIcon size={24} />
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    className="premium-input-sm"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="Paste image URL..."
                                />
                            </div>

                            <div className="field-group">
                                <label><Flag size={14} /> Priority</label>
                                <div className="priority-selector">
                                    {['low', 'medium', 'high', 'critical'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            className={`prio-btn ${priority === p ? `active ${p}` : ''}`}
                                            onClick={() => setPriority(p)}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="field-group">
                                <label>Assignee</label>
                                <select
                                    className="premium-input-sm"
                                    value={assigneeId}
                                    onChange={(e) => setAssigneeId(e.target.value)}
                                >
                                    <option value="">Unassigned</option>
                                    {members.map((m: any) => (
                                        <option key={m.user.id} value={m.user.id}>
                                            {m.user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="field-group">
                                <label>Location</label>
                                <div className="badge-status">
                                    {status.replace('_', ' ').toUpperCase()}
                                </div>
                            </div>

                            <div className="field-group">
                                <label>Sprint</label>
                                <select
                                    className="premium-input-sm"
                                    value={sprintId}
                                    onChange={(e) => setSprintId(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select Sprint</option>
                                    {sprints.map((s: any) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.status})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <footer className="form-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? (
                                <span className="loader">Creating...</span>
                            ) : (
                                <>Save Task</>
                            )}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default CreateIssueModal;
