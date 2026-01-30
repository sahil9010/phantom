import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bookmark, CheckSquare, AlertCircle } from 'lucide-react';
import './IssueCard.css';

interface IssueCardProps {
    issue: any;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: issue.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'critical': return <AlertCircle size={14} color="var(--error)" />;
            case 'high': return <AlertCircle size={14} color="#ffab00" />;
            default: return <Bookmark size={14} color="var(--primary)" />;
        }
    };

    return (
        <div
            className="issue-card"
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            <p className="issue-title">{issue.title}</p>
            <div className="issue-footer">
                <div className="issue-meta">
                    {getPriorityIcon(issue.priority)}
                    <span className="issue-type">{issue.type}</span>
                </div>
                <div className="issue-assignee">
                    {issue.assignee?.name?.[0] || 'U'}
                </div>
            </div>
        </div>
    );
};

export default IssueCard;
