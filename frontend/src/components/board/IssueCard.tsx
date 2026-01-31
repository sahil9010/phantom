import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bookmark, AlertCircle } from 'lucide-react';
import './IssueCard.css';

interface IssueCardProps {
    issue: any;
    members: any[];
    projectKey: string;
    onSelect: (id: string) => void;
    onUpdateAssignee: (issueId: string, assigneeId: string | null) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, members, projectKey, onSelect, onUpdateAssignee }) => {
    const [showAssigneeMenu, setShowAssigneeMenu] = React.useState(false);

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

    const handleAssigneeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowAssigneeMenu(!showAssigneeMenu);
    };

    const handleMemberSelect = (e: React.MouseEvent, memberId: string | null) => {
        e.stopPropagation();
        onUpdateAssignee(issue.id, memberId);
        setShowAssigneeMenu(false);
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
            className={`issue-card ${isDragging ? 'dragging' : ''} ${showAssigneeMenu ? 'show-menu' : ''}`}
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onSelect(issue.id)}
        >
            <p className="issue-title">{issue.title}</p>
            <div className="issue-footer">
                <div className="issue-meta">
                    {getPriorityIcon(issue.priority)}
                    <span className="issue-type">{projectKey} {issue.serialNumber || '?'}</span>
                </div>
                <div className="issue-assignee-container">
                    <div className="issue-assignee" onClick={handleAssigneeClick}>
                        {issue.assignee?.name?.[0] || 'U'}
                    </div>
                    {showAssigneeMenu && (
                        <div className="assignee-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                            <div className="dropdown-item" onClick={(e) => handleMemberSelect(e, null)}>
                                <div className="user-avatar-tiny unassigned">U</div>
                                <span>Unassigned</span>
                            </div>
                            {members.map((m: any) => (
                                <div key={m.userId} className="dropdown-item" onClick={(e) => handleMemberSelect(e, m.userId)}>
                                    <div className="user-avatar-tiny">
                                        {m.user?.name?.[0] || 'U'}
                                    </div>
                                    <span>{m.user?.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IssueCard;
