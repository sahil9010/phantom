import React from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import BoardColumn from './BoardColumn';
import api from '../../services/api';
import './KanbanBoard.css';

const COLUMNS = [
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' },
];

interface KanbanBoardProps {
    issues: any[];
    members: any[];
    setIssues: React.Dispatch<React.SetStateAction<any[]>>;
    projectId: string;
    projectKey: string;
    onSelectIssue: (id: string) => void;
    onStartCreateIssue: (status: string) => void;
    onUpdate: () => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ issues, members, setIssues, projectId, projectKey, onSelectIssue, onStartCreateIssue, onUpdate }) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleUpdateAssignee = async (issueId: string, assigneeId: string | null) => {
        try {
            await api.patch(`/issues/${issueId}`, { assigneeId });
            onUpdate();
        } catch (err) {
            console.error('Failed to update assignee');
        }
    };

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the destination column (overId could be a column ID or an issue ID)
        let destinationColumnId = overId;
        if (!COLUMNS.map(c => c.id).includes(overId)) {
            const overIssue = issues.find(i => i.id === overId);
            if (overIssue) {
                destinationColumnId = overIssue.status;
            }
        }

        const issue = issues.find(i => i.id === activeId);
        if (issue && destinationColumnId && issue.status !== destinationColumnId) {
            const updatedIssues = issues.map(i =>
                i.id === activeId ? { ...i, status: destinationColumnId } : i
            );
            setIssues(updatedIssues);

            try {
                await api.patch(`/issues/${activeId}`, { status: destinationColumnId });
                onUpdate();
            } catch (err) {
                console.error('Failed to update issue status');
                setIssues(issues); // Rollback
            }
        }
    };

    return (
        <div className="kanban-board board-scroll">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={onDragEnd}
            >
                <div className="board-columns">
                    {COLUMNS.map((col) => (
                        <BoardColumn
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            issues={issues.filter(i => i.status === col.id)}
                            members={members}
                            projectId={projectId}
                            setIssues={setIssues}
                            onSelectIssue={onSelectIssue}
                            onStartCreateIssue={onStartCreateIssue}
                            onUpdateAssignee={handleUpdateAssignee}
                        />
                    ))}
                </div>
            </DndContext>
        </div>
    );
};

export default KanbanBoard;
