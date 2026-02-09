import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, Users, UserPlus, MessageSquare } from 'lucide-react';
import api from '../services/api';
import KanbanBoard from '../components/board/KanbanBoard';
import IssueDetails from '../components/issue/IssueDetails';
import CreateIssueModal from '../components/issue/CreateIssueModal';
import AddMemberModal from '../components/project/AddMemberModal';
import FilterBar from '../components/board/FilterBar';
import CreateSprintModal from '../components/project/CreateSprintModal';
import ProjectChat from '../components/project/ProjectChat';
import './ProjectBoard.css';
import socket from '../services/socket';

const ProjectBoard: React.FC = () => {
    const { id } = useParams();
    const [project, setProject] = useState<any>(null);
    const [issues, setIssues] = useState<any[]>([]);
    const [sprints, setSprints] = useState<any[]>([]);
    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
    const [isCreatingIssue, setIsCreatingIssue] = useState<{ status: string } | null>(null);
    const [isManagingMembers, setIsManagingMembers] = useState(false);
    const [isCreatingSprint, setIsCreatingSprint] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<any>({});
    const [view, setView] = useState<'board' | 'backlog'>('board');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const navigate = useNavigate();

    const fetchIssues = async () => {
        try {
            const queryParams = new URLSearchParams({
                ...filters,
                search: searchQuery
            });

            // If viewing board, default to active sprint or no sprint filter if we want all?
            // Usually Board = Active Sprint. Backlog = No Sprint (sprintId=null).
            // For now, let's keep it simple: Filter Bar controls manual filtering. 
            // BUT, if in Backlog view, force sprintId=null.

            if (view === 'backlog') {
                queryParams.set('sprintId', 'null');
            } else {
                // Try to find active sprint
                const activeSprint = sprints.find((s: any) => s.status === 'active');
                if (activeSprint) {
                    queryParams.set('sprintId', activeSprint.id);
                }
                // If no active sprint, maybe show everything or just empty board? 
                // Let's not restrict if no active sprint found for now to avoid confusion, or restriction handled by user manually selecting sprint filter?
            }

            const { data: issuesData } = await api.get(`/issues/project/${id}?${queryParams.toString()}`);
            setIssues(issuesData);
        } catch (err) {
            console.error('Failed to fetch issues');
        }
    };

    const fetchSprints = async () => {
        try {
            const { data } = await api.get(`/projects/${id}/sprints`);
            setSprints(data);
        } catch (error) {
            console.error('Failed to fetch sprints');
        }
    };

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const { data: projectData } = await api.get(`/projects/${id}`);
                setProject(projectData);
            } catch (err) {
                console.error('Failed to fetch project details');
            }
        };

        fetchProject();
        fetchSprints();

        socket.emit('joinProject', id);

        socket.on('issueCreated', (newIssue) => {
            setIssues(prev => {
                if (prev.find(i => i.id === newIssue.id)) return prev;
                return [...prev, newIssue];
            });
        });

        socket.on('issueUpdated', (updatedIssue) => {
            setIssues(prev => prev.map(i => i.id === updatedIssue.id ? updatedIssue : i));
        });

        socket.on('sprintCreated', (newSprint) => {
            setSprints(prev => [...prev, newSprint]);
        });

        socket.on('sprintUpdated', (updatedSprint) => {
            setSprints(prev => prev.map(s => s.id === updatedSprint.id ? updatedSprint : s));
        });

        socket.on('sprintDeleted', (sprintId) => {
            setSprints(prev => prev.filter(s => s.id !== sprintId));
        });

        return () => {
            socket.off('issueCreated');
            socket.off('issueUpdated');
            socket.off('sprintCreated');
            socket.off('sprintUpdated');
            socket.off('sprintDeleted');
        };
    }, [id]);

    useEffect(() => {
        fetchIssues();
    }, [id, filters, searchQuery, view, sprints.length]); // Re-fetch when context changes

    if (!project) return <div>Loading...</div>;

    return (
        <div className="project-board">
            <nav className="breadcrumb">
                Projects / {project.name}
            </nav>

            <header className="board-header">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <h1>{project.name} board</h1>
                    {view === 'board' && sprints.find(s => s.status === 'active') && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-subtle)', fontSize: '0.9rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                                {sprints.find(s => s.status === 'active')?.name}
                            </span>
                            <button
                                className="btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                onClick={async () => {
                                    const s = sprints.find(s => s.status === 'active');
                                    if (window.confirm(`Complete sprint ${s.name}? Incomplete issues will move to backlog.`)) {
                                        try {
                                            await api.patch(`/projects/sprints/${s.id}`, { status: 'completed' });
                                            fetchSprints();
                                        } catch (e) { console.error(e); }
                                    }
                                }}
                            >
                                Complete Sprint
                            </button>
                        </div>
                    )}
                </div>
                <div className="board-controls">
                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${view === 'board' ? 'active' : ''}`}
                            onClick={() => setView('board')}
                        >
                            Board
                        </button>
                        <button
                            className={`toggle-btn ${view === 'backlog' ? 'active' : ''}`}
                            onClick={() => setView('backlog')}
                        >
                            Backlog
                        </button>
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
                    {/* <button className="icon-btn"><Filter size={18} /></button> REMOVED generic filter btn */}
                    <button className="btn-secondary" onClick={() => setIsCreatingSprint(true)}>
                        Create Sprint
                    </button>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }} onClick={() => navigate(`/projects/${id}/team`)}>
                        <Users size={18} />
                        <span>Team</span>
                    </button>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }} onClick={() => setIsManagingMembers(true)}>
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
                <div className="sprints-list-container" style={{ marginBottom: '1rem', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>Planned Sprints</h3>
                    <div className="sprints-grid" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                        {sprints.map((s: any) => (
                            <div key={s.id} className="sprint-card" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--surface-raised)' }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{s.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: '0.5rem' }}>
                                    {s.status.toUpperCase()} • {s.startDate ? new Date(s.startDate).toLocaleDateString() : 'No Date'}
                                </div>
                                {s.status === 'planned' && (
                                    <button
                                        className="btn-primary"
                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        onClick={async () => {
                                            if (window.confirm(`Start sprint ${s.name}?`)) {
                                                try {
                                                    await api.patch(`/projects/sprints/${s.id}`, { status: 'active' });
                                                    fetchSprints();
                                                } catch (e) { console.error(e); }
                                            }
                                        }}
                                    >
                                        Start Sprint
                                    </button>
                                )}
                            </div>
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
                onUpdate={fetchIssues}
            />

            {selectedIssueId && (
                <IssueDetails
                    issueId={selectedIssueId}
                    members={project.members || []}
                    onClose={() => setSelectedIssueId(null)}
                    onUpdate={fetchIssues}
                />
            )}

            {isCreatingIssue && (
                <CreateIssueModal
                    projectId={id!}
                    status={isCreatingIssue.status}
                    members={project.members || []}
                    sprints={sprints}
                    onClose={() => setIsCreatingIssue(null)}
                    onCreated={(newIssue) => {
                        setIssues(prev => [...prev, newIssue]);
                        setSelectedIssueId(newIssue.id);
                    }}
                />
            )}

            {isManagingMembers && (
                <AddMemberModal
                    projectId={id!}
                    existingMembers={project.members || []}
                    onClose={() => setIsManagingMembers(false)}
                    onMemberAdded={() => {
                        // Refresh project details to show new member
                        const fetchProject = async () => {
                            try {
                                const { data: projectData } = await api.get(`/projects/${id}`);
                                setProject(projectData);
                            } catch (err) {
                                console.error('Failed to fetch project details');
                            }
                        };
                        fetchProject();
                    }}
                />
            )}

            {isCreatingSprint && (
                <CreateSprintModal
                    projectId={id!}
                    onClose={() => setIsCreatingSprint(false)}
                    onCreated={() => {
                        fetchSprints();
                    }}
                />
            )}

            {isChatOpen && (
                <div className="board-chat-sidebar">
                    <ProjectChat
                        projectId={id!}
                        onClose={() => setIsChatOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default ProjectBoard;
