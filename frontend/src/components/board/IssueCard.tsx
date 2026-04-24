import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowUp, ArrowDown, AlertTriangle, Minus } from 'lucide-react';
import './IssueCard.css';

interface IssueCardProps {
    issue: any;
    members: any[];
    projectKey: string;
    onSelect: (id: string) => void;
    onUpdateAssignee: (issueId: string, assigneeId: string | null) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, members, projectKey, onSelect, onUpdateAssignee }) => {
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
        touchAction: 'none',
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'critical':
                return <AlertTriangle size={14} color="#DE350B" />;
            case 'high':
                return <ArrowUp size={14} color="#DE350B" />;
            case 'medium':
                return <ArrowUp size={14} color="#FF991F" />;
            case 'low':
                return <ArrowDown size={14} color="#36B37E" />;
            default:
                return <Minus size={14} color="#6B778C" />;
        }
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            '#00B8D9', '#36B37E', '#FF5630', '#6554C0',
            '#FFAB00', '#0065FF', '#00A3BF', '#8777D9'
        ];
        const idx = (name || '').charCodeAt(0) % colors.length;
        return colors[idx];
    };

    const assigneeName = issue.assignee?.name || '';
    const assigneeInitial = assigneeName?.[0]?.toUpperCase() || '?';

    const isDone = issue.status === 'done';

    return (
        <div
            className={`issue-card ${isDragging ? 'dragging' : ''} ${isDone ? 'is-done' : ''}`}
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            data-priority={issue.priority}
            onClick={() => onSelect(issue.id)}
        >
            <p className={`issue-title ${isDone ? 'done-title' : ''}`}>{issue.title}</p>
            <div className="issue-footer">
                <div className="issue-meta">
                    {getPriorityIcon(issue.priority)}
                    <span className="issue-key">{projectKey}-{issue.serialNumber || issue.id.slice(0, 3)}</span>
                </div>
                <div className="issue-assignee-container">
                    <div
                        className="issue-assignee-avatar"
                        style={{ background: getAvatarColor(assigneeName) }}
                        title={assigneeName || 'Unassigned'}
                    >
                        {assigneeInitial}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueCard;
