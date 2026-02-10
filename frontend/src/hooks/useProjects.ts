import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Project } from '../types';
import socket from '../services/socket';

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get<Project[]>('projects');
            setProjects(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch projects');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();

        // Socket listeners for real-time updates
        socket.on('projectCreated', (newProject: Project) => {
            setProjects(prev => prev.some(p => p.id === newProject.id) ? prev : [...prev, newProject]);
        });

        socket.on('projectUpdated', (updatedProject: Project) => {
            setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
        });

        socket.on('projectDeleted', (id: string) => {
            setProjects(prev => prev.filter(p => p.id !== id));
        });

        return () => {
            socket.off('projectCreated');
            socket.off('projectUpdated');
            socket.off('projectDeleted');
        };
    }, [fetchProjects]);

    return { projects, loading, error, refresh: fetchProjects };
};
