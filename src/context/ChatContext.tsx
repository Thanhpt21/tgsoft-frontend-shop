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
  handleUserLogin: (userId: number, tenantId?: number) => void;
  loadMessages: () => Promise<void>;
  errorMessage: string | null; // 🔥 NEW: Error message state
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<{ [userId: number]: boolean }>({});
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // 🔥 NEW: Error state

  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  // 🔥 NEW: Load messages từ backend
  const loadMessages = useCallback(async () => {
    try {
      const userId = localStorage.getItem('userId');
      const storedSessionId = sessionId || localStorage.getItem('sessionId');

      if (!userId && !storedSessionId) {
        console.log('⚠️ No userId or sessionId, skip loading messages');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      let url = '';
      if (conversationId) {
        url = `${apiUrl}/chat/messages?conversationId=${conversationId}`;
      } else if (userId) {
        url = `${apiUrl}/chat/messages?userId=${userId}`;
      } else if (storedSessionId) {
        url = `${apiUrl}/chat/messages?sessionId=${storedSessionId}`;
      }

      console.log('📥 Loading messages from:', url);
      const response = await fetch(url, {
        headers: { 'x-tenant-id': process.env.NEXT_PUBLIC_TENANT_ID || '1' },
      });

      if (!response.ok) {
        setErrorMessage('❌ Không thể tải tin nhắn. Vui lòng thử lại sau.');
        return;
      }

      const data = await response.json();
      console.log('📦 Loaded data:', data);

      let loadedMessages: ChatMessage[] = [];
      if (data.messages && Array.isArray(data.messages)) {
        loadedMessages = data.messages;
      } else if (data.conversations && Array.isArray(data.conversations)) {
        const conv = data.conversations[0];
        if (conv && conv.messages) {
          loadedMessages = conv.messages;
          if (conv.id && conv.id !== -1) {
            setConversationId(conv.id);
          }
        }
      }

      if (loadedMessages.length > 0) {
        console.log('✅ Loaded messages:', loadedMessages.length);
        setMessages(loadedMessages);
        setMessagesLoaded(true);
      } else {
        console.log('⚠️ No new messages loaded, keeping existing messages');
      }
    } catch (error) {
      setErrorMessage('❌ Lỗi khi tải tin nhắn. Vui lòng thử lại sau.');
      console.error('❌ Error loading messages:', error);
    }
  }, [conversationId, sessionId]);

  useEffect(() => {
    const socketInstance = getSocket({
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    
    if (!socketInstance) return;

    setSocket(socketInstance);

    // Connection events
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
      
      if (!messagesLoaded) {
        loadMessages();
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Chat disconnected');
      setIsConnected(false);
    });

    // Nhận sessionId từ server
    socketInstance.on('session-initialized', (data: { sessionId: string }) => {
      console.log('📝 Session initialized:', data.sessionId);
      setSessionId(data.sessionId);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionId', data.sessionId);
      }
      
      if (!messagesLoaded) {
        setTimeout(() => loadMessages(), 500);
      }
    });

    // Nhận conversationId sau khi migrate hoặc tạo mới
    socketInstance.on('conversation-updated', (data: any) => {
        console.log('✅ Conversation updated:', data);
        const convId = data.conversationId || data.id;
        if (convId) {
          setConversationId(convId);
          console.log('💬 ConversationId set to:', convId);
          socketInstance.emit('join:conversation', convId); // Join phòng ngay lập tức
          if (messages.length === 0) {
            setTimeout(() => loadMessages(), 500);
          }
        }
      });

    // Message event - thêm message mới vào list
    socketInstance.on('message', (msg: ChatMessage) => {
      console.log('📨 Received message:', msg);
      setMessages((prev) => {
        const exists = prev.some(m => m.id.toString() === msg.id.toString());
        if (exists) {
          console.log('⚠️ Message already exists, skipping');
          return prev;
        }
        
        console.log('✅ Adding new message to list');
        return [...prev, msg];
      });
    });

    // Typing event
    socketInstance.on('typing', ({ userId, isTyping: typing }: { userId: number; isTyping: boolean }) => {
      console.log('⌨️ Typing event:', { userId, typing });
      setIsTyping((prevState) => ({
        ...prevState,
        [userId]: typing,
      }));

      if (typing) {
        setTimeout(() => {
          setIsTyping((prevState) => ({
            ...prevState,
            [userId]: false,
          }));
        }, 3000);
      }
    });

    // Error event
    socketInstance.on('error', (error: { message: string }) => {
      console.error('🔴 Chat error:', error);
      setErrorMessage('❌ Có lỗi xảy ra, vui lòng thử lại sau.');
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

  // Hàm xử lý khi user login
  const handleUserLogin = useCallback(
    (userId: number, tenantId: number = 1) => {
      if (!socket || !socket.connected) {
        setErrorMessage('❌ Kết nối socket không khả dụng, không thể đăng nhập.');
        return;
      }

      console.log('🔐 Emitting user-login event:', { userId, tenantId });
      socket.emit('user-login', { userId });

      localStorage.setItem('userId', userId.toString());
      
      setTimeout(() => loadMessages(), 1000);
    },
    [socket, loadMessages]
  );

  const sendMessage = useCallback(
    (message: string, metadata?: any) => {
      if (!socket || !message.trim()) {
        setErrorMessage('❌ Tin nhắn không hợp lệ!');
        return;
      }

      console.log('📤 Sending message:', { 
        conversationId, 
        message,
        sessionId,
      });

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
      console.log('🚪 Joining conversation:', id);
      socket.emit('join:conversation', id);
      setConversationId(id);
    },
    [socket]
  );

  const leaveConversation = useCallback(
    (id: number) => {
      if (!socket) return;
      console.log('🚪 Leaving conversation:', id);
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
        errorMessage, // 🔥 NEW: Pass errorMessage to context
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
