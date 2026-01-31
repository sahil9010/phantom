import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserPlus, Mail, MoreVertical, ArrowLeft, Shield } from 'lucide-react';
import api from '../services/api';
import AddMemberModal from '../components/project/AddMemberModal';
import './TeamPage.css';

const TeamPage: React.FC = () => {
    const { id } = useParams();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchProjectData = async () => {
        try {
            const { data } = await api.get(`/projects/${id}`);
            setProject(data);
        } catch (err) {
            console.error('Failed to fetch project data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    if (loading) return <div className="p-4">Loading team...</div>;
    if (!project) return <div className="p-4">Project not found.</div>;

    return (
        <div className="team-page">
            <nav className="breadcrumb" style={{ marginBottom: '1rem' }}>
                <Link to={`/projects/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-subtle)' }}>
                    <ArrowLeft size={16} />
                    Back to Board
                </Link>
            </nav>

            <header className="team-header">
                <div className="header-info">
                    <h1>Project Team</h1>
                    <p style={{ color: 'var(--text-subtle)', marginTop: '0.5rem' }}>
                        Managing collaborators for <strong>{project.name}</strong>
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserPlus size={18} />
                    <span>Invite Member</span>
                </button>
            </header>

            <div className="member-grid">
                {project.members?.map((member: any) => (
                    <div key={member.userId} className="member-card">
                        <button className="more-btn icon-btn">
                            <MoreVertical size={18} />
                        </button>
                        <div className="member-avatar">
                            {member.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="member-info">
                            <h3>{member.user.name}</h3>
                            <p className="member-email">{member.user.email}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Shield size={14} className="text-primary" />
                                <span className="member-role">{member.role}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {project.members?.length === 0 && (
                <div className="empty-state">
                    <Mail size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No members found. Invite your first teammate to get started!</p>
                </div>
            )}

            {showAddModal && (
                <AddMemberModal
                    projectId={id!}
                    existingMembers={project.members || []}
                    onClose={() => setShowAddModal(false)}
                    onMemberAdded={fetchProjectData}
                />
            )}
        </div>
    );
};

export default TeamPage;
