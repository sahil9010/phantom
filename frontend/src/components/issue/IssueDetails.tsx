import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import api from '../../services/api';
import './IssueDetails.css';

interface IssueDetailsProps {
    issueId: string;
    onClose: () => void;
    onUpdate: () => void;
}

const IssueDetails: React.FC<IssueDetailsProps> = ({ issueId, onClose, onUpdate }) => {
    const [issue, setIssue] = useState<any>(null);
    const [comment, setComment] = useState('');

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

    if (!issue) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
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

                        <div className="comments-section">
                            <h3>Comments</h3>
                            <div className="comment-input">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <button onClick={() => { }}><Send size={16} /></button>
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
                            <p><span>Assignee</span> {issue.assignee?.name || 'Unassigned'}</p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default IssueDetails;
