import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';
import socket from '../../services/socket';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import './ProjectChat.css';

interface Message {
    id: string;
    content: string;
    projectId: string;
    authorId: string;
    author: {
        name: string;
        avatarUrl?: string;
    };
    createdAt: string;
}

interface ProjectChatProps {
    projectId: string;
    onClose: () => void;
}

const ProjectChat: React.FC<ProjectChatProps> = ({ projectId, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get(`/chat/${projectId}`);
                setMessages(data);
            } catch (err) {
                console.error('Failed to fetch chat history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();

        socket.on('newMessage', (message: Message) => {
            if (message.projectId === projectId) {
                setMessages(prev => [...prev, message]);
            }
        });

        return () => {
            socket.off('newMessage');
        };
    }, [projectId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        socket.emit('sendMessage', {
            projectId,
            content: newMessage,
            authorId: user?.id
        });

        setNewMessage('');
    };

    return (
        <div className="project-chat-container">
            <div className="chat-header">
                <div className="header-title">
                    <MessageSquare size={18} />
                    <span>Project Chat</span>
                </div>
                <button className="icon-btn" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            <div className="chat-messages" ref={scrollRef}>
                {loading ? (
                    <div className="chat-loading">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="chat-empty">No messages yet. Start the conversation!</div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`chat-message ${msg.authorId === user?.id ? 'own-message' : ''}`}>
                            <div className="message-avatar">
                                {msg.author.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="message-content-wrapper">
                                <div className="message-info">
                                    <span className="author-name">{msg.author.name}</span>
                                    <span className="message-time">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="message-content">{msg.content}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="chat-input-area">
                <form onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProjectChat;
