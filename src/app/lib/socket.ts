import { io, Socket } from 'socket.io-client';

// Use environment variable for socket URL or default to localhost
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

class SocketService {
    private socket: Socket | null = null;
    private isInitialized = false;
    private userId: string | null = null;
    private messageCallbacks: Set<(message: any) => void> = new Set();
    private typingCallbacks: Set<(data: any) => void> = new Set();

    init(userId: string) {
        if (this.isInitialized) return;
        this.userId = userId;

        // Initialize real socket
        this.socket = io(SOCKET_URL, {
            query: { userId },
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: true,
        });

        this.socket.connect();

        this.socket.on('connect', () => {
        });

        this.socket.on('connect_error', (error) => {
        });

        this.socket.on('new_message', (msg) => {
            this.messageCallbacks.forEach(cb => cb(msg));
        });

        this.socket.on('typing_status', (data) => {
            this.typingCallbacks.forEach(cb => cb(data));
        });


        this.isInitialized = true;
    }

    joinThread(threadId: string) {
        if (this.socket) {
            this.socket.emit('join_room', threadId);
        }
    }

    leaveThread(threadId: string) {
        if (this.socket) {
            this.socket.emit('leave_room', threadId);
        }
    }

    sendMessage(message: any) {
        if (this.socket?.connected) {
            // Backend expects { room, ...messageData }
            const payload = { room: message.requestId || message.orderId, ...message };
            this.socket.emit('send_message', payload);
        }
    }

    onMessage(callback: (message: any) => void) {
        this.messageCallbacks.add(callback);
        return () => this.messageCallbacks.delete(callback);
    }

    onTypingStatus(callback: (data: { threadId: string; userId: string; isTyping: boolean }) => void) {
        this.typingCallbacks.add(callback);
        return () => this.typingCallbacks.delete(callback);
    }

    emitTyping(threadId: string, isTyping: boolean) {
        const data = { threadId, userId: this.userId, isTyping };
        if (this.socket?.connected) {
            this.socket.emit('typing', data);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isInitialized = false;
        this.userId = null;
        this.messageCallbacks.clear();
        this.typingCallbacks.clear();
    }
}

export const socketService = new SocketService();
