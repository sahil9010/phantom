import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { Project, Issue, Sprint } from '../types';

export const useProjectBoard = (projectId: string | undefined) => {
    const [project, setProject] = useState<Project | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<any>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState<'board' | 'backlog'>('board');

    const fetchProject = useCallback(async () => {
        if (!projectId) return;
        try {
            const { data } = await api.get(`/projects/${projectId}`);
            setProject(data);
        } catch (err) {
            console.error('Failed to fetch project details');
        }
    }, [projectId]);

    const fetchSprints = useCallback(async () => {
        if (!projectId) return;
        try {
            const { data } = await api.get(`/projects/${projectId}/sprints`);
            setSprints(data);
        } catch (error) {
            console.error('Failed to fetch sprints');
        }
    }, [projectId]);

    const fetchIssues = useCallback(async () => {
        if (!projectId) return;
        try {
            const queryParams = new URLSearchParams({
                ...filters,
                search: searchQuery
            });

            if (view === 'backlog') {
                queryParams.set('sprintId', 'null');
            } else {
                const activeSprint = sprints.find(s => s.status === 'active');
                if (activeSprint) {
                    queryParams.set('sprintId', activeSprint.id);
                }
            }

            const { data } = await api.get(`/issues/project/${projectId}?${queryParams.toString()}`);
            setIssues(data);
        } catch (err) {
            console.error('Failed to fetch issues');
        }
    }, [projectId, filters, searchQuery, view, sprints]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchProject(), fetchSprints()]);
            setLoading(false);
        };
        init();

        if (projectId) {
            socket.emit('joinProject', projectId);

            const handleIssueCreated = (newIssue: Issue) => setIssues(prev => prev.some(i => i.id === newIssue.id) ? prev : [...prev, newIssue]);
            const handleIssueUpdated = (updatedIssue: Issue) => setIssues(prev => prev.map(i => i.id === updatedIssue.id ? updatedIssue : i));
            const handleSprintCreated = (newSprint: Sprint) => setSprints(prev => [...prev, newSprint]);
            const handleSprintUpdated = (updatedSprint: Sprint) => setSprints(prev => prev.map(s => s.id === updatedSprint.id ? updatedSprint : s));

            socket.on('issueCreated', handleIssueCreated);
            socket.on('issueUpdated', handleIssueUpdated);
            socket.on('sprintCreated', handleSprintCreated);
            socket.on('sprintUpdated', handleSprintUpdated);

            return () => {
                socket.off('issueCreated', handleIssueCreated);
                socket.off('issueUpdated', handleIssueUpdated);
                socket.off('sprintCreated', handleSprintCreated);
                socket.off('sprintUpdated', handleSprintUpdated);
            };
        }
    }, [projectId, fetchProject, fetchSprints]);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    return {
        project,
        issues,
        setIssues,
        sprints,
        loading,
        filters,
        setFilters,
        searchQuery,
        setSearchQuery,
        view,
        setView,
        refreshIssues: fetchIssues,
        refreshSprints: fetchSprints,
        refreshProject: fetchProject
    };
};
