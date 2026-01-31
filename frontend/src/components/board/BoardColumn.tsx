import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import IssueCard from './IssueCard';
import { Plus, X, Check, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import CreateIssueModal from '../issue/CreateIssueModal';
import './BoardColumn.css';

interface BoardColumnProps {
    id: string;
    title: string;
    issues: any[];
    members: any[];
    projectId: string;
    projectKey: string;
    setIssues: React.Dispatch<React.SetStateAction<any[]>>;
    onSelectIssue: (id: string) => void;
    onStartCreateIssue: (status: string) => void;
    onUpdateAssignee: (issueId: string, assigneeId: string | null) => void;
}

const BoardColumn: React.FC<BoardColumnProps> = ({ id, title, issues, members, projectId, projectKey, setIssues, onSelectIssue, onStartCreateIssue, onUpdateAssignee }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div className={`board-column ${isOver ? 'is-over' : ''}`} ref={setNodeRef}>
            <div className="column-header">
                <h3>{title}</h3>
                <span className="issue-count">{issues.length}</span>
            </div>

            <div className="column-content">
                <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {issues.map((issue) => (
                        <IssueCard
                            key={issue.id}
                            issue={issue}
                            members={members}
                            projectKey={projectKey}
                            onSelect={onSelectIssue}
                            onUpdateAssignee={onUpdateAssignee}
                        />
                    ))}
                </SortableContext>
            </div>

            <div className="column-footer">
                <button className="create-btn" onClick={() => onStartCreateIssue(id)}>
                    <Plus size={16} />
                    <span>Create issue</span>
                </button>
            </div>
        </div>
    );
};

export default BoardColumn;
