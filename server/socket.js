import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
    const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        process.env.FRONTEND_URL
    ].filter(Boolean);

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        if (socket.handshake.query.userId) {
            socket.join(socket.handshake.query.userId);
            console.log(`User ${socket.id} joined room ${socket.handshake.query.userId}`);
        }

        socket.on('join_room', (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room ${room}`);
        });

        socket.on('leave_room', (room) => {
            socket.leave(room);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
