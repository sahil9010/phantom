export type UserRole = 'admin' | 'project-manager' | 'contributor';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    createdAt: string;
}

export interface Project {
    id: string;
    name: string;
    key: string;
    color?: string;
    managerId: string;
    createdAt: string;
    updatedAt: string;
    members?: User[];
    columns?: string | any[];
    _count?: {
        issues: number;
        members: number;
    };
}

export interface Issue {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'critical';
    projectId: string;
    reporterId: string;
    assigneeId?: string;
    serialNumber?: number;
    attachments?: string; // JSON string in current backend
    createdAt: string;
    updatedAt: string;
    assignee?: User;
    reporter?: User;
    comments?: Comment[];
}

export interface Comment {
    id: string;
    content: string;
    authorId: string;
    issueId: string;
    parentId?: string;
    createdAt: string;
    author: User;
    children?: Comment[];
}

export interface Sprint {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
    status: 'planned' | 'active' | 'completed';
    projectId: string;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}
