import React from 'react';
import { Sprint } from '../../types';

interface SprintCardProps {
    sprint: Sprint;
    onStart: (id: string) => void;
}

const SprintCard: React.FC<SprintCardProps> = ({ sprint, onStart }) => {
    return (
        <div className="sprint-card">
            <div className="name">{sprint.name}</div>
            <div className="meta">
                <span className={`sprint-badge ${sprint.status}`}>{sprint.status}</span>
                {sprint.startDate && ` • ${new Date(sprint.startDate).toLocaleDateString()}`}
            </div>
            {sprint.status === 'planned' && (
                <button
                    className="btn-primary"
                    style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}
                    onClick={() => {
                        if (window.confirm(`Start sprint ${sprint.name}?`)) {
                            onStart(sprint.id);
                        }
                    }}
                >
                    Start Sprint
                </button>
            )}
        </div>
    );
};

export default React.memo(SprintCard);
