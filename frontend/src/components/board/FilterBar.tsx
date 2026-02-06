import React from 'react';
import { Filter, X } from 'lucide-react';
import './FilterBar.css';

interface FilterBarProps {
    members: any[];
    filters: {
        assigneeId?: string;
        type?: string;
        priority?: string;
        label?: string;
    };
    onFilterChange: (filters: any) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ members, filters, onFilterChange }) => {
    const handleChange = (key: string, value: string) => {
        onFilterChange({ ...filters, [key]: value === 'all' ? undefined : value });
    };

    const clearFilters = () => {
        onFilterChange({});
    };

    const hasFilters = Object.values(filters).some(v => v !== undefined);

    return (
        <div className="filter-bar">
            <div className="filter-group">
                <label>Assignee:</label>
                <select
                    value={filters.assigneeId || 'all'}
                    onChange={(e) => handleChange('assigneeId', e.target.value)}
                >
                    <option value="all">All Members</option>
                    {members.map(m => (
                        <option key={m.user.id} value={m.user.id}>
                            {m.user.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label>Type:</label>
                <select
                    value={filters.type || 'all'}
                    onChange={(e) => handleChange('type', e.target.value)}
                >
                    <option value="all">All Types</option>
                    <option value="task">Task</option>
                    <option value="bug">Bug</option>
                    <option value="story">Story</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Priority:</label>
                <select
                    value={filters.priority || 'all'}
                    onChange={(e) => handleChange('priority', e.target.value)}
                >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>
            </div>

            {hasFilters && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                    <X size={14} /> Clear
                </button>
            )}
        </div>
    );
};

export default FilterBar;
