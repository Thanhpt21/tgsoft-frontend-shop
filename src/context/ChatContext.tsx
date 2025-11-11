'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { getSocket, type SocketType } from '@/lib/socket';
import { useQueryClient } from '@tanstack/react-query';
import { useUserConversationIds } from '@/hooks/chat/useUserConversationIds';
import { useAiChatEnabled } from '@/hooks/chat/useAiChatEnabled';

// ==================== INTERFACE ====================

/** Tin nhắn chat */
export interface ChatMessage {
  id: string | number;
  conversationId?: number | null;
  sessionId?: string | null;
  senderId?: number | null;
  senderType: 'USER' | 'GUEST' | 'BOT' | 'ADMIN';
  message: string;
  metadata?: any;
  createdAt: string;
  tempId?: string;
}

/** Các giá trị mà useChat() sẽ trả về */
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
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

// ==================== CONTEXT ====================

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

// ==================== CHAT PROVIDER ====================

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const queryClient = useQueryClient();

  // ==================== STATE ====================

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<{ [userId: number]: boolean }>({});
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // ==================== REF (tránh stale closure) ====================

  const messagesLoadedRef = useRef(messagesLoaded);
  const conversationIdRef = useRef(conversationId);
  const sessionIdRef = useRef(sessionId);

  useEffect(() => {
    messagesLoadedRef.current = messagesLoaded;
  }, [messagesLoaded]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // ==================== CÀI ĐẶT CƠ BẢN ====================

  const tenantId = Number(process.env.NEXT_PUBLIC_TENANT_ID || '1');
  const { data: aiChatEnabled = false } = useAiChatEnabled();

  const localUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const userIdNumber = localUserId ? Number(localUserId) : null;
  const localSessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;

  const { data: dbConversationIds = [] } = useUserConversationIds({
    userId: userIdNumber!,
    tenantId,
    enabled: !!userIdNumber,
  });

  const latestConversationId = dbConversationIds[0] ?? null;

  // ==================== AUTO JOIN LATEST CONVERSATION ====================

  useEffect(() => {
    if (latestConversationId && latestConversationId !== conversationId) {
      setConversationId(latestConversationId);
      setTimeout(() => {
        joinConversation(latestConversationId);
        loadMessages();
      }, 300);
    }
  }, [latestConversationId]);

  // ==================== KHÔI PHỤC SESSION ID ====================

  useEffect(() => {
    if (localSessionId && !sessionId) {
      setSessionId(localSessionId);
    }
  }, [localSessionId, sessionId]);

  // ==================== TẢI TIN NHẮN CŨ (API) ====================

  const loadMessages = useCallback(async () => {
    try {
      const currentSessionId = sessionId || localStorage.getItem('sessionId');

      if (!userIdNumber && !currentSessionId && !conversationId) return;

      let url = '';
      if (conversationId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/chat/messages?conversationId=${conversationId}`;
      }
      if (!url) return;

      const response = await fetch(url, {
        headers: { 'x-tenant-id': tenantId.toString() },
      });

      if (!response.ok) {
        setErrorMessage('Không thể tải tin nhắn. Vui lòng thử lại sau.');
        return;
      }

      const data = await response.json();
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
        setMessages(loadedMessages);
        setMessagesLoaded(true);
      }
    } catch (error) {
      setErrorMessage('Lỗi khi tải tin nhắn.');
      console.error('Error loading messages:', error);
    }
  }, [conversationId, sessionId, userIdNumber, tenantId]);

  // ==================== KHỞI TẠO SOCKET (CHỈ 1 LẦN) ====================

  useEffect(() => {
    const socketInstance = getSocket({
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    if (!socketInstance) return;

    setSocket(socketInstance);

    // --- XỬ LÝ SỰ KIỆN SOCKET ---

    const handleConnect = () => {
      setIsConnected(true);
      if (!messagesLoadedRef.current) loadMessages();
    };

    const handleDisconnect = () => setIsConnected(false);

    const handleSessionInitialized = (data: { sessionId: string }) => {
      setSessionId(data.sessionId);
      localStorage.setItem('sessionId', data.sessionId);
      if (!messagesLoadedRef.current) {
        setTimeout(() => loadMessages(), 500);
      }
    };

    const handleConversationUpdated = (data: any) => {
      const convId = data.conversationId || data.id;
      if (convId && convId !== conversationIdRef.current) {
        setConversationId(convId);
        if (socketInstance.connected) {
          socketInstance.emit('join:conversation', convId);
        }
        setTimeout(() => loadMessages(), 500);
      }
    };

    // 🔥 FIX FINAL: Logic kiểm tra message linh hoạt hơn
    const handleMessage = (msg: ChatMessage) => {
      console.log('📨 Received message:', msg);
      console.log('🔍 Current state:', {
        conversationId: conversationIdRef.current,
        sessionId: sessionIdRef.current,
        msgConversationId: msg.conversationId,
        msgSessionId: msg.sessionId,
      });
      
      setMessages((prev) => {
        // ✅ KIỂM TRA LINH HOẠT:
        // 1. Nếu message có conversationId → check xem có khớp không
        const hasConvId = msg.conversationId && msg.conversationId !== null;
        const matchConv = hasConvId && msg.conversationId === conversationIdRef.current;
        
        // 2. Nếu message có sessionId → check xem có khớp không
        const hasSessionId = msg.sessionId && msg.sessionId !== null;
        const matchSession = hasSessionId && msg.sessionId === sessionIdRef.current;
        
        // 3. Nếu message không có cả 2 ID → có thể là BOT message đầu tiên
        const noIds = !hasConvId && !hasSessionId;
        
        // ✅ CHẤP NHẬN MESSAGE NẾU:
        // - Khớp conversationId HOẶC
        // - Khớp sessionId HOẶC
        // - Message không có ID nào (edge case cho BOT message đầu tiên)
        const shouldAccept = matchConv || matchSession || (noIds && conversationIdRef.current);
        
        if (!shouldAccept) {
          console.log('⚠️ Message không thuộc về user này, bỏ qua');
          return prev;
        }

        console.log('✅ Message hợp lệ, tiếp tục xử lý');

        // ✅ Xử lý tempId (thay thế tin nhắn tạm bằng tin thật)
        if (msg.tempId) {
          const hasTemp = prev.some((m) => m.id === msg.tempId);
          if (hasTemp) {
            console.log('✅ Thay thế tin nhắn tạm:', msg.tempId, '→', msg.id);
            return prev.map((m) =>
              m.id === msg.tempId ? { ...msg, tempId: undefined } : m
            );
          }
        }

        // ✅ Kiểm tra tin nhắn đã tồn tại chưa
        const exists = prev.some((m) => m.id.toString() === msg.id.toString());
        if (exists) {
          console.log('⚠️ Tin nhắn đã tồn tại:', msg.id);
          return prev;
        }

        // ✅ Thêm tin nhắn mới
        console.log('✅ Thêm tin nhắn mới:', msg.id, msg.senderType);
        return [...prev, msg];
      });
    };

    const handleTyping = ({
      userId,
      isTyping: typing,
    }: {
      userId: number;
      isTyping: boolean;
    }) => {
      setIsTyping((prev) => ({ ...prev, [userId]: typing }));
      if (typing) {
        setTimeout(() => {
          setIsTyping((prev) => ({ ...prev, [userId]: false }));
        }, 3000);
      }
    };

    const handleError = (error: { message: string }) => {
      console.error('Chat error:', error);
      setErrorMessage('Có lỗi xảy ra, vui lòng thử lại sau.');
    };

    // --- GẮN SỰ KIỆN ---
    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('session-initialized', handleSessionInitialized);
    socketInstance.on('conversation-updated', handleConversationUpdated);
    socketInstance.on('message', handleMessage);
    socketInstance.on('typing', handleTyping);
    socketInstance.on('error', handleError);

    // --- DỌN DẸP KHI UNMOUNT ---
    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('session-initialized', handleSessionInitialized);
      socketInstance.off('conversation-updated', handleConversationUpdated);
      socketInstance.off('message', handleMessage);
      socketInstance.off('typing', handleTyping);
      socketInstance.off('error', handleError);
    };
  }, []);

  // ==================== ĐĂNG NHẬP NGƯỜI DÙNG ====================

  const handleUserLogin = useCallback(
    async (userId: number, tenantIdParam: number = 1) => {
      if (!socket) {
        setErrorMessage('Kết nối socket không khả dụng.');
        return;
      }

      try {
        if (!socket.connected) {
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(
              () => reject(new Error('Socket connection timeout')),
              5000
            );

            if (socket.connected) {
              clearTimeout(timeout);
              resolve();
              return;
            }

            socket.once('connect', () => {
              clearTimeout(timeout);
              resolve();
            });
            socket.once('connect_error', (error: any) => {
              clearTimeout(timeout);
              reject(error);
            });
          });
        }

        socket.emit('user-login', { userId });
        localStorage.setItem('userId', userId.toString());

        try {
          const conversationIds = await queryClient.fetchQuery<number[]>({
            queryKey: ['chat', 'conversation-ids', userId, tenantIdParam],
            queryFn: async () => {
              const params = new URLSearchParams();
              params.append('userId', userId.toString());
              if (tenantIdParam) {
                params.append('tenantId', tenantIdParam.toString());
              }

              const apiUrl = process.env.NEXT_PUBLIC_API_URL;
              const res = await fetch(
                `${apiUrl}/chat/conversation-ids?${params.toString()}`,
                {
                  headers: { 'x-tenant-id': tenantIdParam.toString() },
                }
              );

              if (!res.ok) throw new Error('Failed to fetch conversation IDs');
              const data = await res.json();
              return data.conversationIds || [];
            },
          });

          const latestConvId = conversationIds[0] ?? null;
          if (latestConvId && latestConvId !== conversationId) {
            setConversationId(latestConvId);
            if (socket.connected) {
              socket.emit('join:conversation', latestConvId);
            }
            setTimeout(() => loadMessages(), 300);
          }
        } catch (error) {
          console.error('Error fetching conversation IDs on login:', error);
        }

        queryClient.invalidateQueries({
          queryKey: ['chat', 'conversation-ids', userId],
        });
        setTimeout(() => loadMessages(), 1000);
      } catch (error) {
        console.error('Error in handleUserLogin:', error);
        setErrorMessage('Không thể kết nối đến server chat. Vui lòng thử lại.');
      }
    },
    [socket, conversationId, loadMessages, queryClient]
  );

  // ==================== GỬI TIN NHẮN ====================

  const sendMessage = useCallback(
    (message: string, metadata?: any) => {
      if (!socket || !message.trim()) return;

      const tempId = `temp-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: tempId,
        tempId,
        senderType: 'USER',
        message: message.trim(),
        conversationId,
        sessionId,
        createdAt: new Date().toISOString(),
        metadata,
      };

      // Hiển thị ngay tin nhắn tạm
      setMessages((prev) => [...prev, userMessage]);

      // Gửi qua socket
      socket.emit('send:message', {
        conversationId,
        message: message.trim(),
        metadata,
        tempId,
      });
    },
    [socket, conversationId, sessionId]
  );

  // ==================== THAM GIA / RỜI CUỘC TRÒ CHUYỆN ====================

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

  // ==================== RENDER CONTEXT ====================

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
        isChatOpen,
        setIsChatOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// ==================== HOOK useChat ====================

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat phải được dùng trong ChatProvider');
  }
  return context;
};