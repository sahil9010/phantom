import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import api from '../../services/api';
import './IssueDetails.css';
import socket from '../../services/socket';
import { useAuthStore } from '../../store/authStore';
import { Edit2, Trash2, Check, X as CloseIcon, Reply } from 'lucide-react';
import CommentItem from './CommentItem';

interface IssueDetailsProps {
    issueId: string;
    members: any[];
    onClose: () => void;
    onUpdate: () => void;
}

const IssueDetails: React.FC<IssueDetailsProps> = ({ issueId, members, onClose, onUpdate }) => {
    const [issue, setIssue] = useState<any>(null);
    const [comment, setComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

    // Reply and Mention State
    const [replyToId, setReplyToId] = useState<string | null>(null);
    const [replyToName, setReplyToName] = useState<string | null>(null);
    const [mentionQuery, setMentionQuery] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const [mentionIndex, setMentionIndex] = useState(0);

    const { user } = useAuthStore();

    // Build comment tree from flat list
    const rootComments = React.useMemo(() => {
        if (!issue?.comments) return [];
        const commentMap = new Map();
        const roots: any[] = [];

        // First pass: map all comments
        issue.comments.forEach((c: any) => {
            commentMap.set(c.id, { ...c, children: [] });
        });

        // Second pass: attach children
        issue.comments.forEach((c: any) => {
            if (c.parentId) {
                const parent = commentMap.get(c.parentId);
                if (parent) {
                    parent.children.push(commentMap.get(c.id));
                }
            } else {
                roots.push(commentMap.get(c.id));
            }
        });

        // Sort by date descending
        return roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [issue?.comments]);

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

        socket.on('commentCreated', (newComment: any) => {
            if (newComment.issueId === issueId) {
                setIssue((prev: any) => ({
                    ...prev,
                    comments: [newComment, ...(prev?.comments || [])]
                }));
            }
        });

        socket.on('commentUpdated', (updatedComment: any) => {
            setIssue((prev: any) => ({
                ...prev,
                comments: prev?.comments?.map((c: any) => c.id === updatedComment.id ? updatedComment : c)
            }));
        });

        socket.on('commentDeleted', ({ id, issueId: cIssueId }: any) => {
            if (cIssueId === issueId) {
                setIssue((prev: any) => ({
                    ...prev,
                    comments: prev?.comments?.filter((c: any) => c.id !== id)
                }));
            }
        });

        return () => {
            socket.off('commentCreated');
            socket.off('commentUpdated');
            socket.off('commentDeleted');
        };
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

    const handleReply = (id: string, authorName: string) => {
        setReplyToId(id);
        setReplyToName(authorName);
        // Focus input
        const input = document.getElementById('comment-input');
        if (input) input.focus();
    };

    const cancelReply = () => {
        setReplyToId(null);
        setReplyToName(null);
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setComment(val);

        // Simple mention detection: checks if last word starts with @
        const lastWord = val.split(' ').pop();
        if (lastWord && lastWord.startsWith('@') && lastWord.length > 1) {
            setMentionQuery(lastWord.slice(1));
            setShowMentions(true);
        } else {
            setShowMentions(false);
        }
    };

    const insertMention = (name: string) => {
        const words = comment.split(' ');
        words.pop(); // Remove the partial @mention
        const newText = [...words, `@${name} `].join(' ');
        setComment(newText);
        setShowMentions(false);
        const input = document.getElementById('comment-input');
        if (input) input.focus();
    };

    const handleAddComment = async () => {
        if (!comment.trim()) return;

        try {
            const { data } = await api.post('comments', {
                content: comment,
                issueId,
                parentId: replyToId
            });
            setReplyToId(null);
            setReplyToName(null);
            // Locally update to feel responsive, socket will catch it too if we don't handle dedup
            // But usually we just let the socket handle it or check for existence
            setComment('');
        } catch (err) {
            console.error('Failed to post comment');
        }
    };

    const handleUpdateComment = async (id: string) => {
        if (!editContent.trim()) return;
        try {
            await api.patch(`/comments/${id}`, { content: editContent });
            setEditingCommentId(null);
            setEditContent('');
        } catch (err) {
            console.error('Failed to update comment');
        }
    };

    const handleDeleteComment = async (id: string) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await api.delete(`/comments/${id}`);
        } catch (err) {
            console.error('Failed to delete comment');
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
                            <div className="comment-input-wrapper" style={{ position: 'relative' }}>
                                {replyToId && (
                                    <div className="replying-banner">
                                        <span>Replying to {replyToName}</span>
                                        <button onClick={cancelReply}><X size={12} /></button>
                                    </div>
                                )}

                                {showMentions && (
                                    <div className="mention-dropdown">
                                        {members
                                            .filter(m => m.user.name.toLowerCase().includes(mentionQuery.toLowerCase()))
                                            .map(m => (
                                                <div
                                                    key={m.user.id}
                                                    className="mention-option"
                                                    onClick={() => insertMention(m.user.name)}
                                                >
                                                    {m.user.name}
                                                </div>
                                            ))}
                                    </div>
                                )}

                                <div className="comment-input">
                                    <input
                                        id="comment-input"
                                        type="text"
                                        placeholder={replyToId ? "Write a reply..." : "Add a comment... (use @ to mention)"}
                                        value={comment}
                                        onChange={handleCommentChange}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddComment();
                                        }}
                                        autoComplete="off"
                                    />
                                    <button onClick={handleAddComment}><Send size={16} /></button>
                                </div>
                            </div>

                            <div className="comments-list">
                                {rootComments.map((c: any) => (
                                    <CommentItem
                                        key={c.id}
                                        comment={c}
                                        onReply={handleReply}
                                        onDelete={handleDeleteComment}
                                        onEdit={(id, content) => {
                                            setEditingCommentId(id);
                                            setEditContent(content);
                                        }}
                                    />
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
