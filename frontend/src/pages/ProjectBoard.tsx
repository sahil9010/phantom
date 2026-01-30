import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import api from '../services/api';
import KanbanBoard from '../components/board/KanbanBoard';
import './ProjectBoard.css';

const ProjectBoard: React.FC = () => {
    const { id } = useParams();
    const [project, setProject] = useState<any>(null);
    const [issues, setIssues] = useState<any[]>([]);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const { data: projectData } = await api.get(`/projects/${id}`);
                setProject(projectData);

                const { data: issuesData } = await api.get(`/issues/project/${id}`);
                setIssues(issuesData);
            } catch (err) {
                console.error('Failed to fetch project details');
            }
        };
        fetchProject();
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
                        <input type="text" placeholder="Search this board" />
                    </div>
                    <button className="icon-btn"><Filter size={18} /></button>
                    <button className="icon-btn"><MoreHorizontal size={18} /></button>
                </div>
            </header>

            <KanbanBoard issues={issues} setIssues={setIssues} projectId={id!} />
        </div>
    );
};

export default ProjectBoard;
