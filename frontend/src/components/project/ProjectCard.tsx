import React from 'react';
import { Layout, Edit2, Trash2, Check } from 'lucide-react';
import { Project, User } from '../../types';

interface ProjectCardProps {
    project: Project;
    user: User | null;
    isEditing: boolean;
    editName: string;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
    onUpdate: (e: React.FormEvent) => void;
    onEditNameChange: (val: string) => void;
    onCancelEdit: () => void;
    onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
    project,
    user,
    isEditing,
    editName,
    onEdit,
    onDelete,
    onUpdate,
    onEditNameChange,
    onCancelEdit,
    onClick
}) => {
    return (
        <div className="project-card" onClick={onClick}>
            <div className="project-top">
                <div className="project-icon" style={{ backgroundColor: project.color ? `${project.color}15` : 'var(--surface-raised)' }}>
                    <Layout size={24} color={project.color || 'var(--primary)'} />
                </div>
                {user?.role === 'admin' && (
                    <div className="project-actions">
                        <button className="edit-project-btn" onClick={onEdit} title="Edit Project">
                            <Edit2 size={16} />
                        </button>
                        <button className="delete-project-btn" onClick={onDelete} title="Delete Project">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>
            <div className="project-info">
                {isEditing ? (
                    <div className="edit-project-form" onClick={e => e.stopPropagation()}>
                        <input
                            value={editName}
                            onChange={e => onEditNameChange(e.target.value)}
                            autoFocus
                            onKeyDown={e => {
                                if (e.key === 'Enter') onUpdate(e);
                                if (e.key === 'Escape') onCancelEdit();
                            }}
                        />
                        <button onClick={onUpdate}><Check size={16} /></button>
                    </div>
                ) : (
                    <>
                        <h3>{project.name}</h3>
                        <p>{project.key} • {project._count?.issues || 0} active issues</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default React.memo(ProjectCard);
