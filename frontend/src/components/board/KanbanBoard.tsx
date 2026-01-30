import React from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
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
    setIssues: React.Dispatch<React.SetStateAction<any[]>>;
    projectId: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ issues, setIssues, projectId }) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const issueId = active.id as string;
        const overId = over.id as string;

        // Check if we dropped on a different column
        if (COLUMNS.map(c => c.id).includes(overId)) {
            const issue = issues.find(i => i.id === issueId);
            if (issue && issue.status !== overId) {
                const updatedIssues = issues.map(i =>
                    i.id === issueId ? { ...i, status: overId } : i
                );
                setIssues(updatedIssues);

                try {
                    await api.patch(`/issues/${issueId}`, { status: overId });
                } catch (err) {
                    console.error('Failed to update issue status');
                    setIssues(issues); // Rollback
                }
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
                        />
                    ))}
                </div>
            </DndContext>
        </div>
    );
};

export default KanbanBoard;
