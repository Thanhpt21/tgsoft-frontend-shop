'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { getSocket, type SocketType } from '@/lib/socket';
import { useQueryClient } from '@tanstack/react-query';
import { useUserConversationIds } from '@/hooks/chat/useUserConversationIds';

// Interface khớp với backend response
export interface ChatMessage {
  id: string | number;
  conversationId?: number;
  sessionId?: string;
  senderId?: number | null;
  senderType: 'USER' | 'GUEST' | 'BOT' | 'ADMIN';
  message: string;
  metadata?: any;
  createdAt: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (message: string, metadata?: any) => void;
  isConnected: boolean;
  conversationId: number | null;
  sessionId: string | null;
  isTyping: { [userId: number]: boolean };
  joinConversation: (id: number) => void;
  leaveConversation: (id: number) => void;
  handleUserLogin: (userId: number, tenantId?: number) => Promise<void>;
  loadMessages: () => Promise<void>;
  errorMessage: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<{ [userId: number]: boolean }>({});
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lấy tenantId từ env
  const tenantId = Number(process.env.NEXT_PUBLIC_TENANT_ID || '1');

  // Lấy userId từ localStorage (ban đầu)
  const localUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const userIdNumber = localUserId ? Number(localUserId) : null;

  // Lấy sessionId từ localStorage (cho guest)
  const localSessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;

  // DÙNG HOOK MỚI: LẤY CONVERSATION IDS TỪ DB (cache)
  const {
    data: dbConversationIds = [],
    isLoading: loadingConversationIds,
  } = useUserConversationIds({
    userId: userIdNumber!,
    tenantId,
    enabled: !!userIdNumber,
  });

  // LẤY CONVERSATION ID MỚI NHẤT TỪ CACHE
  const latestConversationId = dbConversationIds[0] ?? null;

  // CẬP NHẬT TỪ CACHE (nếu có thay đổi)
  useEffect(() => {
    if (latestConversationId && latestConversationId !== conversationId) {
      console.log('Conversation ID updated from cache:', latestConversationId);
      setConversationId(latestConversationId);
      setTimeout(() => {
        joinConversation(latestConversationId); // <-- ĐÃ FIX!
        loadMessages();
    }, 300);
    }
  }, [latestConversationId, conversationId]);

  // CẬP NHẬT SESSION ID CHO GUEST
  useEffect(() => {
    if (localSessionId && !sessionId) {
      console.log('Session ID from localStorage:', localSessionId);
      setSessionId(localSessionId);
    }
  }, [localSessionId, sessionId]);

  // Load messages từ backend
  const loadMessages = useCallback(async () => {
    try {
      const currentSessionId = sessionId || localStorage.getItem('sessionId');

      if (!userIdNumber && !currentSessionId && !conversationId) {
        console.log('No identifiers, skip loading messages');
        return;
      }

      let url = '';

      if (conversationId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/chat/messages?conversationId=${conversationId}`;
      }

      if (!url) return;

      console.log('Loading messages from:', url);
      const response = await fetch(url, {
        headers: { 'x-tenant-id': tenantId.toString() },
      });

      if (!response.ok) {
        setErrorMessage('Không thể tải tin nhắn. Vui lòng thử lại sau.');
        return;
      }

      const data = await response.json();
      console.log('Loaded data:', data);

      let loadedMessages: ChatMessage[] = [];
      if (data.messages && Array.isArray(data.messages)) {
        loadedMessages = data.messages;
      } else if (data.conversations && Array.isArray(data.conversations)) {
        const conv = data.conversations[0];
        if (conv?.messages) {
          loadedMessages = conv.messages;
          if (conv.id && conv.id !== -1 && !conversationId) {
            setConversationId(conv.id);
          }
        }
      }

      if (loadedMessages.length > 0) {
        console.log('Loaded messages:', loadedMessages.length);
        setMessages(loadedMessages);
        setMessagesLoaded(true);
      }
    } catch (error) {
      setErrorMessage('Lỗi khi tải tin nhắn.');
      console.error('Error loading messages:', error);
    }
  }, [conversationId, sessionId, localSessionId, userIdNumber, tenantId]);

  // Socket connection
  useEffect(() => {
    const socketInstance = getSocket({
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    if (!socketInstance) return;

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      if (!messagesLoaded) loadMessages();
    });

    socketInstance.on('disconnect', () => {
      console.log('Chat disconnected');
      setIsConnected(false);
    });

    socketInstance.on('session-initialized', (data: { sessionId: string }) => {
      console.log('Session initialized:', data.sessionId);
      setSessionId(data.sessionId);
      localStorage.setItem('sessionId', data.sessionId);
      if (!messagesLoaded) setTimeout(() => loadMessages(), 500);
    });

    socketInstance.on('conversation-updated', (data: any) => {
      console.log('Conversation updated:', data);
      const convId = data.conversationId || data.id;
      if (convId && convId !== conversationId) {
        setConversationId(convId);
        joinConversation(convId);
        socketInstance.emit('join:conversation', convId);
        if (messages.length === 0) setTimeout(() => loadMessages(), 500);
      }
    });

    socketInstance.on('message', (msg: ChatMessage) => {
      console.log('Received message:', msg);
      setMessages((prev) => {
        const exists = prev.some(m => m.id.toString() === msg.id.toString());
        return exists ? prev : [...prev, msg];
      });
    });

    socketInstance.on('typing', ({ userId, isTyping: typing }: { userId: number; isTyping: boolean }) => {
      setIsTyping((prev) => ({ ...prev, [userId]: typing }));
      if (typing) {
        setTimeout(() => setIsTyping((prev) => ({ ...prev, [userId]: false })), 3000);
      }
    });

    socketInstance.on('error', (error: { message: string }) => {
      console.error('Chat error:', error);
      setErrorMessage('Có lỗi xảy ra, vui lòng thử lại sau.');
    });

    return () => {
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('session-initialized');
      socketInstance.off('conversation-updated');
      socketInstance.off('message');
      socketInstance.off('typing');
      socketInstance.off('error');
    };
  }, [messagesLoaded, loadMessages]);

  // XỬ LÝ USER LOGIN – GỌI useUserConversationIds NGAY
const handleUserLogin = useCallback(
  async (userId: number, tenantId: number = 1) => {
    if (!socket) {
      setErrorMessage('Kết nối socket không khả dụng.');
      return;
    }

    try {
      // 🔥 ĐỢI SOCKET CONNECT TRƯỚC!
      if (!socket.connected) {
        console.log('⏳ Waiting for socket to connect...');
        
        // Đợi tối đa 5 giây
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Socket connection timeout'));
          }, 5000);

          if (socket.connected) {
            clearTimeout(timeout);
            resolve();
            return;
          }

          socket.once('connect', () => {
            clearTimeout(timeout);
            console.log('✅ Socket connected, proceeding with login...');
            resolve();
          });

          socket.once('connect_error', (error: any) => {
            clearTimeout(timeout);
            reject(error);
          });
        });
      }

      console.log('🔐 Socket is connected, emitting user-login:', { userId });
      socket.emit('user-login', { userId });

      // Lưu userId
      localStorage.setItem('userId', userId.toString());

      // Fetch conversation IDs
      try {
        const conversationIds = await queryClient.fetchQuery<number[]>({
          queryKey: ['chat', 'conversation-ids', userId, tenantId],
          queryFn: async () => {
            const params = new URLSearchParams();
            params.append('userId', userId.toString());
            if (tenantId) params.append('tenantId', tenantId.toString());

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${apiUrl}/chat/conversation-ids?${params.toString()}`, {
              headers: { 'x-tenant-id': tenantId.toString() },
            });

            if (!res.ok) throw new Error('Failed to fetch conversation IDs');
            const data = await res.json();
            return data.conversationIds || [];
          },
        });

        const latestConversationId = conversationIds[0] ?? null;
        if (latestConversationId && latestConversationId !== conversationId) {
          console.log('💬 Conversation ID fetched immediately:', latestConversationId);
          setConversationId(latestConversationId);
          
          // Join conversation sau khi có ID
          if (socket.connected) {
            socket.emit('join:conversation', latestConversationId);
            console.log('🚪 Joined conversation:', latestConversationId);
          }
          
          setTimeout(() => loadMessages(), 300);
        }
      } catch (error) {
        console.error('❌ Error fetching conversation IDs on login:', error);
      }

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ['chat', 'conversation-ids', userId],
      });

      // Load messages
      setTimeout(() => loadMessages(), 1000);

    } catch (error) {
      console.error('❌ Error in handleUserLogin:', error);
      setErrorMessage('Không thể kết nối đến server chat. Vui lòng thử lại.');
    }
  },
  [socket, conversationId, loadMessages, queryClient]
);

  const sendMessage = useCallback(
    (message: string, metadata?: any) => {
      if (!socket || !message.trim()) {
        setErrorMessage('Tin nhắn không hợp lệ!');
        return;
      }

      socket.emit('send:message', {
        conversationId,
        message: message.trim(),
        metadata,
        sessionId,
      });
    },
    [socket, conversationId, sessionId]
  );

  const joinConversation = useCallback(
    (id: number) => {
      if (!socket) return;
      socket.emit('join:conversation', id);
      setConversationId(id);
    },
    [socket]
  );

  const leaveConversation = useCallback(
    (id: number) => {
      if (!socket) return;
      socket.emit('leave:conversation', id);
      setConversationId(null);
    },
    [socket]
  );

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        isConnected,
        conversationId,
        sessionId,
        isTyping,
        joinConversation,
        leaveConversation,
        handleUserLogin,
        loadMessages,
        errorMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};