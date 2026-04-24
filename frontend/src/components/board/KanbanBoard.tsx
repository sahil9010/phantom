import React, { useState } from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import BoardColumn from './BoardColumn';
import IssueCard from './IssueCard';
import api from '../../services/api';
import './KanbanBoard.css';

interface KanbanBoardProps {
    issues: any[];
    members: any[];
    columns: any[];
    setIssues: React.Dispatch<React.SetStateAction<any[]>>;
    projectId: string;
    projectKey: string;
    onSelectIssue: (id: string) => void;
    onStartCreateIssue: (status: string) => void;
    onUpdate: () => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ issues, members, columns, setIssues, projectId, projectKey, onSelectIssue, onStartCreateIssue, onUpdate }) => {
    const [activeId, setActiveId] = useState<string | null>(null);

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

    // Find which column an issue belongs to
    const findColumnForIssue = (issueId: string): string | null => {
        const issue = issues.find(i => i.id === issueId);
        return issue ? issue.status : null;
    };

    const onDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeColumn = findColumnForIssue(activeId);
        const columnIds = columns.map(c => c.id);

        // Determine the destination column
        let overColumn: string | null = null;
        if (columnIds.includes(overId)) {
            // Dropped directly on a column (empty area)
            overColumn = overId;
        } else {
            overColumn = findColumnForIssue(overId);
        }

        if (!activeColumn || !overColumn || activeColumn === overColumn) return;

        // Move issue to new column during drag (live preview)
        setIssues(prev => {
            return prev.map(issue => {
                if (issue.id === activeId) {
                    return { ...issue, status: overColumn };
                }
                return issue;
            });
        });
    };

    const onDragEnd = async (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const columnIds = columns.map(c => c.id);

        // Determine the destination column
        let destinationColumnId: string;
        if (columnIds.includes(overId)) {
            destinationColumnId = overId;
        } else {
            const overIssue = issues.find(i => i.id === overId);
            if (!overIssue) return;
            destinationColumnId = overIssue.status;
        }

        const activeIssue = issues.find(i => i.id === activeId);
        if (!activeIssue) return;

        // Get all issues in the destination column
        const columnIssues = issues.filter(i => i.status === destinationColumnId && i.id !== activeId);

        // Find the position to insert
        let newIndex = columnIssues.length; // Default: end
        if (!columnIds.includes(overId)) {
            // Dropped on another issue - find its index
            const overIndex = columnIssues.findIndex(i => i.id === overId);
            if (overIndex >= 0) {
                newIndex = overIndex;
            }
        }

        // Build the new ordered list for this column
        const reorderedColumn = [...columnIssues];
        reorderedColumn.splice(newIndex, 0, { ...activeIssue, status: destinationColumnId });

        // Create rank updates for all issues in the column
        const updates = reorderedColumn.map((issue, index) => ({
            id: issue.id,
            status: destinationColumnId,
            rank: index,
        }));

        // Optimistically update local state
        setIssues(prev => {
            const otherIssues = prev.filter(i => i.status !== destinationColumnId || (i.id === activeId));
            // Remove the active issue from otherIssues if it was in a different column
            const filteredOthers = otherIssues.filter(i => i.id !== activeId);

            const updatedColumnIssues = reorderedColumn.map((issue, index) => ({
                ...issue,
                status: destinationColumnId,
                rank: index,
            }));

            return [...filteredOthers, ...updatedColumnIssues];
        });

        // Persist to backend
        try {
            await api.post('issues/reorder', { updates });
        } catch (err) {
            console.error('Failed to reorder issues:', err);
            onUpdate(); // Refresh from server on failure
        }
    };

    const activeIssue = activeId ? issues.find(i => i.id === activeId) : null;

    return (
        <div className="kanban-board board-scroll">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
            >
                <div className="board-columns">
                    {columns.sort((a, b) => a.order - b.order).map((col) => {
                        const columnIssues = issues
                            .filter(i => i.status === col.id)
                            .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));

                        return (
                            <BoardColumn
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                issues={columnIssues}
                                members={members}
                                projectId={projectId}
                                projectKey={projectKey}
                                setIssues={setIssues}
                                onSelectIssue={onSelectIssue}
                                onStartCreateIssue={onStartCreateIssue}
                                onUpdateAssignee={handleUpdateAssignee}
                            />
                        );
                    })}
                </div>

                <DragOverlay>
                    {activeIssue ? (
                        <IssueCard
                            issue={activeIssue}
                            members={members}
                            projectKey={projectKey}
                            onSelect={() => {}}
                            onUpdateAssignee={() => {}}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default KanbanBoard;
