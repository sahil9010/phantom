import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, Users, UserPlus } from 'lucide-react';
import api from '../services/api';
import KanbanBoard from '../components/board/KanbanBoard';
import IssueDetails from '../components/issue/IssueDetails';
import CreateIssueModal from '../components/issue/CreateIssueModal';
import AddMemberModal from '../components/project/AddMemberModal';
import './ProjectBoard.css';
import socket from '../services/socket';

const ProjectBoard: React.FC = () => {
    const { id } = useParams();
    const [project, setProject] = useState<any>(null);
    const [issues, setIssues] = useState<any[]>([]);
    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
    const [isCreatingIssue, setIsCreatingIssue] = useState<{ status: string } | null>(null);
    const [isManagingMembers, setIsManagingMembers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const fetchIssues = async () => {
        try {
            const { data: issuesData } = await api.get(`/issues/project/${id}`);
            setIssues(issuesData);
        } catch (err) {
            console.error('Failed to fetch issues');
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
        fetchIssues();

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

    if (!project) return <div>Loading...</div>;

    return (
        <div className="project-board">
            <nav className="breadcrumb">
                Projects / {project.name}
            </nav>

            <header className="board-header">
                <h1>{project.name} board</h1>
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
                    <button className="icon-btn"><Filter size={18} /></button>
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

            <KanbanBoard
                issues={issues.filter(i =>
                    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (i.description && i.description.toLowerCase().includes(searchQuery.toLowerCase()))
                )}
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
        </div>
    );
};

export default ProjectBoard;
