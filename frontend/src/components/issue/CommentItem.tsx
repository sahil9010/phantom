import React from 'react';
import { Edit2, Trash2, Reply, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface CommentItemProps {
    comment: any;
    onReply: (id: string, authorName: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, content: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, onDelete, onEdit }) => {
    const { user } = useAuthStore();
    const isAuthor = user?.id === comment.authorId;

    const renderContent = (text: string) => {
        // Highlight mentions
        const parts = text.split(/(@\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return <span key={i} className="mention-highlight">{part}</span>;
            }
            return part;
        });
    };

    return (
        <div className="comment-item-container">
            <div className={`comment-item ${comment.parentId ? 'reply-item' : ''}`}>
                <div className="comment-header">
                    <div className="author-info">
                        <div className="author-avatar-sm">
                            {comment.author?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="author-meta">
                            <strong>{comment.author?.name}</strong>
                            <span className="timestamp">{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="comment-actions">
                        <button onClick={() => onReply(comment.id, comment.author.name)} className="action-btn" title="Reply">
                            <Reply size={14} />
                        </button>
                        {isAuthor && (
                            <>
                                <button onClick={() => onEdit(comment.id, comment.content)} className="action-btn" title="Edit">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => onDelete(comment.id)} className="action-btn delete" title="Delete">
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div className="comment-body">
                    {renderContent(comment.content)}
                </div>
            </div>

            {/* Render Children Recursively */}
            {comment.children && comment.children.length > 0 && (
                <div className="comment-children">
                    {comment.children.map((child: any) => (
                        <CommentItem
                            key={child.id}
                            comment={child}
                            onReply={onReply}
                            onDelete={onDelete}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
