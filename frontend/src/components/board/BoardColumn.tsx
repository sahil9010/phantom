import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import IssueCard from './IssueCard';
import './BoardColumn.css';

interface BoardColumnProps {
    id: string;
    title: string;
    issues: any[];
}

const BoardColumn: React.FC<BoardColumnProps> = ({ id, title, issues }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div className="board-column" ref={setNodeRef}>
            <div className="column-header">
                <h3>{title}</h3>
                <span className="issue-count">{issues.length}</span>
            </div>

            <div className="column-content">
                <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {issues.map((issue) => (
                        <IssueCard key={issue.id} issue={issue} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};

export default BoardColumn;
