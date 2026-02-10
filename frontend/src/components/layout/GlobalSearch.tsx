import React, { useState, useEffect } from 'react';
import { Search, Command } from 'lucide-react';
import './GlobalSearch.css';

const GlobalSearch: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!isOpen) return (
        <button className="global-search-trigger" onClick={() => setIsOpen(true)}>
            <div className="flex items-center gap-2">
                <Search size={16} />
                <span>Quick search...</span>
            </div>
            <div className="search-shortcut">
                <Command size={12} />
                <span>K</span>
            </div>
        </button>
    );

    return (
        <div className="global-search-overlay" onClick={() => setIsOpen(false)}>
            <div className="global-search-modal" onClick={e => e.stopPropagation()}>
                <div className="search-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        className="search-input"
                        placeholder="Search projects, tasks, or team members..."
                        autoFocus
                    />
                </div>
                <div className="search-results">
                    <div className="search-section">
                        <label>Recent Projects</label>
                        <div className="search-item">Phantom Mare</div>
                        <div className="search-item">Celestial Marketplace</div>
                    </div>
                    <div className="search-section">
                        <label>Tasks</label>
                        <div className="search-item">Implement Mobile Responsiveness</div>
                        <div className="search-item">Fix Chat Visibility</div>
                    </div>
                </div>
                <div className="search-footer">
                    <span>Press Enter to select</span>
                    <span>Press Escape to close</span>
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
