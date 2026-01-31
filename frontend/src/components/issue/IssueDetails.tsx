import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import api from '../../services/api';
import './IssueDetails.css';

interface IssueDetailsProps {
    issueId: string;
    members: any[];
    onClose: () => void;
    onUpdate: () => void;
}

const IssueDetails: React.FC<IssueDetailsProps> = ({ issueId, members, onClose, onUpdate }) => {
    const [issue, setIssue] = useState<any>(null);
    const [comment, setComment] = useState('');
    const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                const { data } = await api.get(`/issues/${issueId}`);
                setIssue(data);
            } catch (err) {
                console.error('Failed to fetch issue details');
            }
        };
        fetchIssue();
    }, [issueId]);

    const handleUpdate = async (field: string, value: any) => {
        try {
            await api.patch(`/issues/${issueId}`, { [field]: value });
            setIssue({ ...issue, [field]: value });
            onUpdate();
        } catch (err) {
            console.error('Update failed');
        }
    };

    const handleAddComment = async () => {
        if (!comment.trim()) return;

        try {
            const { data } = await api.post('comments', {
                content: comment,
                issueId
            });
            setIssue({
                ...issue,
                comments: [data, ...(issue.comments || [])]
            });
            setComment('');
        } catch (err) {
            console.error('Failed to post comment');
        }
    };

    const handleAddAttachment = async () => {
        if (!newAttachmentUrl.trim()) return;

        const currentAttachments = JSON.parse(issue.attachments || '[]');
        const updatedAttachments = [...currentAttachments, newAttachmentUrl];

        try {
            await api.patch(`/issues/${issueId}`, { attachments: JSON.stringify(updatedAttachments) });
            setIssue({ ...issue, attachments: JSON.stringify(updatedAttachments) });
            setNewAttachmentUrl('');
        } catch (err) {
            console.error('Failed to add attachment');
        }
    };

    if (!issue) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content landscape-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <span className="issue-key">ISSUE-{issue.id.slice(0, 4).toUpperCase()}</span>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </header>

                <div className="modal-body">
                    <div className="main-content">
                        <h2 contentEditable onBlur={(e) => handleUpdate('title', e.target.innerText)}>
                            {issue.title}
                        </h2>

                        <div className="description-section">
                            <label>Description</label>
                            <textarea
                                value={issue.description || ''}
                                onChange={(e) => setIssue({ ...issue, description: e.target.value })}
                                onBlur={(e) => handleUpdate('description', e.target.value)}
                                placeholder="Add a description..."
                            />
                        </div>

                        <div className="attachments-section">
                            <label>Attachments & Images</label>
                            <div className="attachment-grid">
                                {JSON.parse(issue.attachments || '[]').map((url: string, idx: number) => (
                                    <div key={idx} className="attachment-preview">
                                        <img src={url} alt="attachment" onClick={() => window.open(url, '_blank')} />
                                    </div>
                                ))}
                            </div>
                            <div className="attachment-input">
                                <input
                                    type="text"
                                    placeholder="Paste image URL..."
                                    value={newAttachmentUrl}
                                    onChange={(e) => setNewAttachmentUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddAttachment()}
                                />
                                <button className="add-btn" onClick={handleAddAttachment}>Add</button>
                            </div>
                        </div>

                        <div className="comments-section">
                            <h3>Comments</h3>
                            <div className="comment-input">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddComment();
                                    }}
                                />
                                <button onClick={handleAddComment}><Send size={16} /></button>
                            </div>

                            <div className="comments-list">
                                {issue.comments?.map((c: any) => (
                                    <div key={c.id} className="comment-item">
                                        <div className="comment-header">
                                            <strong>{c.author?.name}</strong>
                                            <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p>{c.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <aside className="side-content">
                        <div className="field-group">
                            <label>Status</label>
                            <select value={issue.status} onChange={(e) => handleUpdate('status', e.target.value)}>
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                            </select>
                        </div>

                        <div className="field-group">
                            <label>Priority</label>
                            <select value={issue.priority} onChange={(e) => handleUpdate('priority', e.target.value)}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        <div className="meta-info">
                            <p><span>Reporter</span> {issue.reporter?.name}</p>
                            <div className="field-group" style={{ marginTop: '1rem' }}>
                                <label>Assignee</label>
                                <select
                                    className="premium-input-sm"
                                    style={{ width: '100%', background: 'var(--surface-raised)', color: 'var(--text)' }}
                                    value={issue.assigneeId || ''}
                                    onChange={(e) => handleUpdate('assigneeId', e.target.value || null)}
                                >
                                    <option value="">Unassigned</option>
                                    {members.map((m: any) => (
                                        <option key={m.user.id} value={m.user.id}>
                                            {m.user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default IssueDetails;
