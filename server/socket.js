import { Server } from 'socket.io';
import fs from 'fs';

let io;

function logSync(msg) {
    fs.writeSync(1, `--- [SOCKET] ${msg}\n`);
}

export const initSocket = (httpServer) => {
    logSync('Initializing Socket.io...');
    const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "https://pengu-six.vercel.app",
        "https://pengu.work.gd",
        process.env.FRONTEND_URL
    ].flatMap(o => o ? o.split(',').map(s => s.trim()) : []);

    logSync(`Whitelist: ${allowedOrigins.join(', ')}`);

    io = new Server(httpServer, {
        cors: {
            origin: function (origin, callback) {
                if (!origin) return callback(null, true);
                const isAllowed = allowedOrigins.includes(origin) ||
                    (origin.endsWith('.vercel.app') && origin.includes('pengu'));

                if (isAllowed) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ["GET", "POST"],
            credentials: true
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
