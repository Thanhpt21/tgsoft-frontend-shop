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
    }
    // 🔥 Lấy userId nếu đã đăng nhập
    const userIdStr = localStorage.getItem('userId');
    const userId = userIdStr && !isNaN(parseInt(userIdStr, 10))
      ? parseInt(userIdStr, 10)
      : null;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      console.error('WebSocket URL is not defined in environment variables.');
      return null;
    }


     // 🔥 Tối ưu reconnection config
    socket = ioClient(`${wsUrl}/chat`, {
      auth: {
        userId,
        sessionId,
        tenantId: parseInt(process.env.NEXT_PUBLIC_TENANT_ID || '1', 10),
        isAdmin: false,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: options.reconnectionDelay || 500, // 🔥 Giảm từ 2000 → 500ms
      reconnectionDelayMax: 3000, // 🔥 Max 3s
      reconnectionAttempts: options.reconnectionAttempts || 10, // 🔥 Tăng từ 5 → 10 lần
      timeout: 5000, // 🔥 Giảm từ 10s → 5s
      forceNew: false,
      upgrade: true,
      rememberUpgrade: true,
    });

    // Connection events
    socket.on('connect', () => {
  
    });

    socket.on('disconnect', (reason: string) => {
    });

    socket.on('connect_error', (error: Error) => {
      console.error('🔴 Socket connection error:', error);
    });

    socket.on('reconnect_attempt', (attemptNumber: number) => {
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

// 🔥 Thêm function để check connection status
export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};

// 🔥 Thêm function để force reconnect
export const reconnectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};