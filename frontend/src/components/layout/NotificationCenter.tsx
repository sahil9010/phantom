import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import socket from '../../services/socket';
import './NotificationCenter.css';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    projectId?: string;
    issueId?: string;
    createdAt: string;
}

const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        fetchNotifications();

        socket.on('notification', (newNotif: Notification) => {
            setNotifications(prev => [newNotif, ...prev]);
        });

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            socket.off('notification');
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    const handleAcceptInvite = async (projectId: string, notificationId: string) => {
        try {
            await api.patch(`/projects/${projectId}/members/accept`);
            handleMarkAsRead(notificationId);
            // Optionally redirect or refresh projects
            window.location.reload();
        } catch (err) {
            console.error('Failed to accept invite');
        }
    };

    const handleRejectInvite = async (projectId: string, notificationId: string) => {
        try {
            await api.patch(`/projects/${projectId}/members/reject`);
            handleMarkAsRead(notificationId);
        } catch (err) {
            console.error('Failed to reject invite');
        }
    };

    return (
        <div className="notification-center" ref={dropdownRef}>
            <button className="badge-btn" onClick={() => setIsOpen(!isOpen)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h3>Notifications</h3>
                    </div>
                    <div className="notification-list">
                        {notifications.length === 0 && (
                            <div className="empty-notif">No notifications</div>
                        )}
                        {notifications.map(n => (
                            <div key={n.id} className={`notification-item ${!n.isRead ? 'unread' : ''}`}>
                                <div className="notif-content">
                                    <h4>{n.title}</h4>
                                    <p>{n.message}</p>
                                    <span className="timestamp">{new Date(n.createdAt).toLocaleString()}</span>

                                    {n.type === 'project_invitation' && !n.isRead && (
                                        <div className="notif-actions">
                                            <button className="accept-btn" onClick={() => handleAcceptInvite(n.projectId!, n.id)}>
                                                <Check size={14} /> Accept
                                            </button>
                                            <button className="reject-btn" onClick={() => handleRejectInvite(n.projectId!, n.id)}>
                                                <X size={14} /> Reject
                                            </button>
                                        </div>
                                    )}

                                    {n.link && (
                                        <a href={n.link} className="view-link" onClick={() => handleMarkAsRead(n.id)}>
                                            <ExternalLink size={12} /> View
                                        </a>
                                    )}
                                </div>
                                {!n.isRead && (
                                    <button className="mark-read" onClick={() => handleMarkAsRead(n.id)} title="Mark as read">
                                        <Check size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
