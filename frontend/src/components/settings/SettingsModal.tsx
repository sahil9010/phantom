import React, { useEffect, useState } from 'react';
import { X, Moon, Bell, Maximize2 } from 'lucide-react';
import api from '../../services/api';
import './SettingsModal.css';

interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const [settings, setSettings] = useState({
        theme: 'system',
        emailNotifications: true,
        compactMode: false,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                setSettings({
                    theme: data.theme,
                    emailNotifications: data.emailNotifications,
                    compactMode: data.compactMode,
                });
            } catch (error) {
                console.error('Failed to fetch settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            await api.patch('/settings', settings);
            // In a real app, apply theme/etc here or via context
            onClose();
            alert('Settings saved!');
        } catch (error) {
            console.error('Failed to save settings');
            alert('Failed to save settings');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content settings-modal">
                <button className="close-btn" onClick={onClose}><X size={20} /></button>
                <h2>User Settings</h2>

                {loading ? <p>Loading...</p> : (
                    <div className="settings-form">
                        <div className="setting-item">
                            <div className="setting-label">
                                <Moon size={18} />
                                <span>Theme</span>
                            </div>
                            <select
                                value={settings.theme}
                                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">System</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <div className="setting-label">
                                <Bell size={18} />
                                <span>Email Notifications</span>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.emailNotifications}
                                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-label">
                                <Maximize2 size={18} />
                                <span>Compact Mode</span>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.compactMode}
                                    onChange={(e) => setSettings({ ...settings, compactMode: e.target.checked })}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={onClose}>Cancel</button>
                            <button className="primary-btn" onClick={handleSave}>Save Changes</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsModal;
