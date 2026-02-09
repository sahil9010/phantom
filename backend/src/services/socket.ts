import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import prisma from '../config/db';

let io: Server;

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:5173',
                'http://localhost:5174',
                'http://192.168.1.25:5174',
                'https://pm.sahilmaharjan1.com.np',
                'https://phantom-theta-gray.vercel.app'
            ],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('joinProject', (projectId: string) => {
            socket.join(`project_${projectId}`);
            console.log(`Socket ${socket.id} joined project_${projectId}`);
        });

        socket.on('joinUser', (userId: string) => {
            socket.join(`user_${userId}`);
            console.log(`Socket ${socket.id} joined user_${userId}`);
        });

        socket.on('sendMessage', async ({ projectId, content, authorId }: { projectId: string, content: string, authorId: string }) => {
            try {
                // Verify membership
                const member = await prisma.member.findUnique({
                    where: { userId_projectId: { userId: authorId, projectId } }
                });

                if (!member) {
                    console.error('User not member of project');
                    return;
                }

                const message = await prisma.chatMessage.create({
                    data: {
                        content,
                        projectId,
                        authorId
                    },
                    include: {
                        author: {
                            select: { id: true, name: true, avatarUrl: true }
                        }
                    }
                });

                io.to(`project_${projectId}`).emit('newMessage', message);
            } catch (error) {
                console.error('Send message error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

export const emitToProject = (projectId: string, event: string, data: any) => {
    if (io) {
        io.to(`project_${projectId}`).emit(event, data);
    }
};

export const emitToUser = (userId: string, event: string, data: any) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
    }
};

export const emitGlobal = (event: string, data: any) => {
    if (io) {
        io.emit(event, data);
    }
};
