import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Users, UserPlus, MessageSquare, MoreHorizontal } from 'lucide-react';
import KanbanBoard from '../components/board/KanbanBoard';
import IssueDetails from '../components/issue/IssueDetails';
import CreateIssueModal from '../components/issue/CreateIssueModal';
import AddMemberModal from '../components/project/AddMemberModal';
import FilterBar from '../components/board/FilterBar';
import CreateSprintModal from '../components/project/CreateSprintModal';
import ProjectChat from '../components/project/ProjectChat';
import SprintCard from '../components/project/SprintCard';
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
    const [isCreatingSprint, setIsCreatingSprint] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

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

    if (loading || !project) return <div className="loading-state">Loading workspace...</div>;

    return (
        <div className="project-board">
            <nav className="breadcrumb">
                Projects / {project.name}
            </nav>

            <header className="board-header">
                <div className="header-title-section">
                    <h1>{project.name} board</h1>
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
                    <div className="search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search issues..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="btn-secondary" onClick={() => setIsCreatingSprint(true)}>Create Sprint</button>
                    <button className="btn-secondary icon-text" onClick={() => navigate(`/projects/${id}/team`)}>
                        <Users size={18} />
                        <span>Team</span>
                    </button>
                    <button className="btn-primary icon-text" onClick={() => setIsManagingMembers(true)}>
                        <UserPlus size={18} />
                        <span>Invite</span>
                    </button>
                    <button className={`icon-btn ${isChatOpen ? 'active' : ''}`} onClick={() => setIsChatOpen(!isChatOpen)}>
                        <MessageSquare size={18} />
                    </button>
                    <button className="icon-btn"><MoreHorizontal size={18} /></button>
                </div>
            </header>

            <FilterBar
                members={project.members || []}
                filters={filters}
                onFilterChange={setFilters}
            />

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

            <KanbanBoard
                issues={issues}
                members={project.members || []}
                setIssues={setIssues}
                projectId={id!}
                projectKey={project.key}
                onSelectIssue={setSelectedIssueId}
                onStartCreateIssue={(status) => setIsCreatingIssue({ status })}
                onUpdate={refreshIssues}
            />

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

            {isChatOpen && (
                <div className="board-chat-sidebar">
                    <ProjectChat projectId={id!} onClose={() => setIsChatOpen(false)} />
                </div>
            )}
        </div>
    );
};

export default ProjectBoard;
