import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:5174', 'http://192.168.1.25:5174'],
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

export const emitGlobal = (event: string, data: any) => {
    if (io) {
        io.emit(event, data);
    }
};
