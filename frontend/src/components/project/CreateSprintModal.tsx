import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';
import './CreateSprintModal.css';

interface CreateSprintModalProps {
    projectId: string;
    onClose: () => void;
    onCreated: (sprint: any) => void;
}

const CreateSprintModal: React.FC<CreateSprintModalProps> = ({ projectId, onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        setIsLoading(true);
        try {
            const { data } = await api.post(`/projects/${projectId}/sprints`, {
                name,
                startDate: startDate || null,
                endDate: endDate || null
            });
            onCreated(data);
            onClose();
        } catch (error) {
            console.error('Failed to create sprint', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Create Sprint</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Sprint Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Sprint 1, Board Sprint..."
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Sprint'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSprintModal;
