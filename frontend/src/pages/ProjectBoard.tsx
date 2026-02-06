import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, Users, UserPlus } from 'lucide-react';
import api from '../services/api';
import KanbanBoard from '../components/board/KanbanBoard';
import IssueDetails from '../components/issue/IssueDetails';
import CreateIssueModal from '../components/issue/CreateIssueModal';
import AddMemberModal from '../components/project/AddMemberModal';
import FilterBar from '../components/board/FilterBar';
import CreateSprintModal from '../components/project/CreateSprintModal';
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

        return () => {
            socket.off('issueCreated');
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
                <h1>{project.name} board</h1>
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
                    <button className="icon-btn"><MoreHorizontal size={18} /></button>
                </div>
            </header>

            <FilterBar
                members={project.members || []}
                filters={filters}
                onFilterChange={setFilters}
            />

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
        </div>
    );
};

export default ProjectBoard;
