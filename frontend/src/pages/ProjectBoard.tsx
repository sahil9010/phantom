import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Users, UserPlus, MessageSquare, MoreHorizontal, Plus } from 'lucide-react';
import KanbanBoard from '../components/board/KanbanBoard';
import IssueDetails from '../components/issue/IssueDetails';
import CreateIssueModal from '../components/issue/CreateIssueModal';
import AddMemberModal from '../components/project/AddMemberModal';
import FilterBar from '../components/board/FilterBar';
import CreateSprintModal from '../components/project/CreateSprintModal';
import ProjectChat from '../components/project/ProjectChat';
import SprintCard from '../components/project/SprintCard';
import ColumnManager from '../components/board/ColumnManager';
import './ProjectBoard.css';
import { useProjectBoard } from '../hooks/useProjectBoard';
import api from '../services/api';

const ProjectBoard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        project, issues, setIssues, sprints, loading,
        filters, setFilters,
        searchQuery, setSearchQuery,
        view, setView,
        refreshIssues, refreshSprints, refreshProject
    } = useProjectBoard(id);

    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
    const [isCreatingIssue, setIsCreatingIssue] = useState<{ status: string } | null>(null);
    const [isManagingMembers, setIsManagingMembers] = useState(false);
    const [isManagingColumns, setIsManagingColumns] = useState(false);
    const [isCreatingSprint, setIsCreatingSprint] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const projectColumns = useMemo(() => {
        const DEFAULT_COLUMNS = [
            { id: 'todo', title: 'To Do', order: 0 },
            { id: 'in_progress', title: 'In Progress', order: 1 },
            { id: 'review', title: 'Review', order: 2 },
            { id: 'done', title: 'Done', order: 3 }
        ];

        if (!project?.columns) return DEFAULT_COLUMNS;
        try {
            const parsed = typeof project.columns === 'string' ? JSON.parse(project.columns) : project.columns;
            return (Array.isArray(parsed) && parsed.length > 0) ? parsed : DEFAULT_COLUMNS;
        } catch (e) {
            console.error('Failed to parse columns', e);
            return DEFAULT_COLUMNS;
        }
    }, [project?.columns]);

    const activeSprint = useMemo(() => sprints.find(s => s.status === 'active'), [sprints]);

    const handleCompleteSprint = useCallback(async () => {
        if (!activeSprint) return;
        if (window.confirm(`Complete sprint ${activeSprint.name}? Incomplete issues will move to backlog.`)) {
            try {
                await api.patch(`/projects/sprints/${activeSprint.id}`, { status: 'completed' });
                refreshSprints();
            } catch (e) {
                console.error(e);
            }
        }
    }, [activeSprint, refreshSprints]);

    const handleStartSprint = useCallback(async (sprintId: string) => {
        try {
            await api.patch(`/projects/sprints/${sprintId}`, { status: 'active' });
            refreshSprints();
        } catch (e) {
            console.error(e);
        }
    }, [refreshSprints]);

    if (loading || !project) return <div className="loading-state">Loading board...</div>;

    return (
        <div className={`project-board ${isChatOpen ? 'chat-open' : ''}`}>
            <div className="board-content-wrapper">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    Projects / {project.name} / {view === 'board' ? 'Board' : 'Backlog'}
                </nav>

                {/* Header */}
                <header className="board-header">
                    <div className="header-title-section">
                        <h1>{project.key} board</h1>
                        {view === 'board' && activeSprint && (
                            <div className="active-sprint-info">
                                <span className="sprint-name">{activeSprint.name}</span>
                                <button className="btn-secondary sm" onClick={handleCompleteSprint}>
                                    Complete Sprint
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="board-controls">
                        <div className="view-toggle">
                            <button className={`toggle-btn ${view === 'board' ? 'active' : ''}`} onClick={() => setView('board')}>Board</button>
                            <button className={`toggle-btn ${view === 'backlog' ? 'active' : ''}`} onClick={() => setView('backlog')}>Backlog</button>
                        </div>
                    </div>

                    <div className="board-actions">
                        <button className="btn-create-issue" onClick={() => setIsCreatingIssue({ status: 'todo' })}>
                            <Plus size={16} />
                            <span>Create</span>
                        </button>
                        <div className="search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Avatar group placeholder */}
                        <div style={{ display: 'flex', marginLeft: '8px' }}>
                            {(project.members || []).slice(0, 4).map((m: any, i: number) => (
                                <div
                                    key={m.user?.id || i}
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: ['#00B8D9', '#36B37E', '#FF5630', '#6554C0'][i % 4],
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        marginLeft: i > 0 ? '-6px' : '0',
                                        border: '2px solid #fff',
                                        zIndex: 4 - i,
                                        position: 'relative',
                                    }}
                                    title={m.user?.name || ''}
                                >
                                    {m.user?.name?.[0]?.toUpperCase() || '?'}
                                </div>
                            ))}
                        </div>

                        <button className="btn-secondary" onClick={() => setIsCreatingSprint(true)}>
                            Sprint
                        </button>
                        <button className="icon-btn" onClick={() => navigate(`/projects/${id}/team`)} title="Team">
                            <Users size={18} />
                        </button>
                        <button className="btn-primary" onClick={() => setIsManagingMembers(true)}>
                            <UserPlus size={16} />
                            <span>Invite</span>
                        </button>
                        <button className={`icon-btn ${isChatOpen ? 'active' : ''}`} onClick={() => setIsChatOpen(!isChatOpen)} title="Chat">
                            <MessageSquare size={18} />
                        </button>
                        <button className="icon-btn" onClick={() => setIsManagingColumns(true)} title="Board settings">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
                </header>

                {/* Filters */}
                <FilterBar
                    members={project.members || []}
                    filters={filters}
                    onFilterChange={setFilters}
                />

                {/* Sprints list (backlog view) */}
                {view === 'backlog' && sprints.length > 0 && (
                    <div className="sprints-list-container">
                        <h3>Planned Sprints</h3>
                        <div className="sprints-grid">
                            {sprints.map(s => (
                                <SprintCard key={s.id} sprint={s} onStart={handleStartSprint} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Board */}
                <KanbanBoard
                    issues={issues}
                    members={project.members || []}
                    columns={projectColumns}
                    setIssues={setIssues}
                    projectId={id!}
                    projectKey={project.key}
                    onSelectIssue={setSelectedIssueId}
                    onStartCreateIssue={(status) => setIsCreatingIssue({ status })}
                    onUpdate={refreshIssues}
                />

                {/* Modals */}
                {isManagingColumns && (
                    <ColumnManager
                        projectId={id!}
                        currentColumns={projectColumns}
                        onClose={() => setIsManagingColumns(false)}
                        onUpdate={refreshProject}
                    />
                )}

                {selectedIssueId && (
                    <IssueDetails
                        issueId={selectedIssueId}
                        members={project.members || []}
                        onClose={() => setSelectedIssueId(null)}
                        onUpdate={refreshIssues}
                    />
                )}

                {isCreatingIssue && (
                    <CreateIssueModal
                        projectId={id!}
                        status={isCreatingIssue.status}
                        members={(project as any).members || []}
                        sprints={sprints}
                        onClose={() => setIsCreatingIssue(null)}
                        onCreated={(newIssue) => {
                            refreshIssues();
                            setSelectedIssueId(newIssue.id);
                        }}
                    />
                )}

                {isManagingMembers && (
                    <AddMemberModal
                        projectId={id!}
                        existingMembers={(project as any).members || []}
                        onClose={() => setIsManagingMembers(false)}
                        onMemberAdded={refreshProject}
                    />
                )}

                {isCreatingSprint && (
                    <CreateSprintModal
                        projectId={id!}
                        onClose={() => setIsCreatingSprint(false)}
                        onCreated={refreshSprints}
                    />
                )}
            </div>

            {isChatOpen && (
                <div className="board-chat-sidebar">
                    <ProjectChat projectId={id!} onClose={() => setIsChatOpen(false)} />
                </div>
            )}
        </div>
    );
};

export default ProjectBoard;
