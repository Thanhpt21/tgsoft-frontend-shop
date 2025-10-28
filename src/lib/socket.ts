import ioClient from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

export type SocketType = ReturnType<typeof ioClient>;

let socket: SocketType | null = null;

interface SocketOptions {
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export const getSocket = (options: SocketOptions = {}): SocketType | null => {
  if (typeof window === 'undefined') return null; // server-side check

  if (!socket) {
    // 🔥 Lấy hoặc tạo sessionId
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('sessionId', sessionId);
      console.log('🔑 Created new sessionId:', sessionId);
    }
    // 🔥 Lấy userId nếu đã đăng nhập
    const userIdStr = localStorage.getItem('userId');
    const userId = userIdStr && !isNaN(parseInt(userIdStr, 10))
      ? parseInt(userIdStr, 10)
      : null;

    socket = ioClient(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/chat', {
      auth: {
        userId,
        sessionId,
        tenantId: parseInt(process.env.NEXT_PUBLIC_TENANT_ID || '1', 10),
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: options.reconnectionDelay || 1000,
      reconnectionAttempts: options.reconnectionAttempts || 5,
    });

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id);
  
    });

    socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket disconnected:', reason);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('🔴 Socket connection error:', error);
    });

    socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`🔄 Attempting to reconnect: #${attemptNumber}`);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed.');
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};