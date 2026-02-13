import React, { useState } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import api from '../../services/api';

interface Column {
    id: string;
    title: string;
    order: number;
}

interface ColumnManagerProps {
    projectId: string;
    currentColumns: Column[];
    onClose: () => void;
    onUpdate: () => void;
}

const ColumnManager: React.FC<ColumnManagerProps> = ({ projectId, currentColumns, onClose, onUpdate }) => {
    const [columns, setColumns] = useState<Column[]>([...currentColumns].sort((a, b) => a.order - b.order));
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddColumn = () => {
        if (columns.length >= 7) {
            setError('Maximum 7 columns allowed');
            return;
        }
        const newId = `col_${Date.now()}`;
        setColumns([...columns, { id: newId, title: 'New Column', order: columns.length }]);
    };

    const handleRemoveColumn = (id: string) => {
        if (columns.length <= 1) {
            setError('At least one column is required');
            return;
        }
        setColumns(columns.filter(c => c.id !== id).map((c, i) => ({ ...c, order: i })));
    };

    const handleRenameColumn = (id: string, newTitle: string) => {
        setColumns(columns.map(c => c.id === id ? { ...c, title: newTitle } : c));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            await api.patch(`/projects/${projectId}`, { columns });
            onUpdate();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save columns');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '500px' }}>
                <div className="premium-header">
                    <div className="header-left">
                        <div className="icon-circle">
                            <Plus size={20} color="var(--primary)" />
                        </div>
                        <h2>Manage Board Columns</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="p-4 flex flex-col gap-4">
                    <p className="text-sm text-subtle">
                        Customize your board workflow. You can have up to 7 columns.
                    </p>

                    {error && <div className="text-error text-sm p-3 bg-red-50 text-red-600 rounded-md border border-red-100">{error}</div>}

                    <div className="flex flex-col gap-2">
                        {columns.map((col) => (
                            <div key={col.id} className="flex items-center gap-3 p-3 bg-surface-raised rounded-md border border-border">
                                <GripVertical size={16} className="text-subtle cursor-grab" />
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent border-none outline-none font-medium"
                                    value={col.title}
                                    onChange={(e) => handleRenameColumn(col.id, e.target.value)}
                                    placeholder="Column name"
                                />
                                <button
                                    className="text-subtle hover:text-error transition-colors"
                                    onClick={() => handleRemoveColumn(col.id)}
                                    title="Remove column"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {columns.length < 7 && (
                        <button
                            className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-md text-subtle hover:border-primary hover:text-primary transition-all font-medium"
                            onClick={handleAddColumn}
                        >
                            <Plus size={18} />
                            <span>Add Column</span>
                        </button>
                    )}
                </div>

                <div className="form-footer p-4">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ColumnManager;
