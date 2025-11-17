'use client';

import { useState, useEffect, useRef, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import { getSocket, type SocketType } from '@/lib/socket';
import { useQueryClient } from '@tanstack/react-query';
import { useUserConversationIds } from '@/hooks/chat/useUserConversationIds';
import { useGetAiChatEnabled } from '@/hooks/chat/useGetAiChatEnabled';
import { useSaveBotMessage } from '@/hooks/chat/useSaveBotMessage';
import { useCurrent } from '@/hooks/auth/useCurrent';
import { useTenantAIConfig } from '@/hooks/tenant/useTenantAIConfig';
import { useAllProducts } from '@/hooks/product/useAllProducts';
import { Product } from '@/types/product.type';
import Link from 'next/link';
import { useAiMessage } from '@/hooks/chat/useAiMessage';

// ==================== TYPES ====================

export interface ChatMessage {
  id: string | number;
  conversationId?: number | null;
  sessionId?: string | null;
  senderId?: number | null;
  senderType: 'USER' | 'GUEST' | 'BOT' | 'ADMIN' | 'AI';
  message: string;
  metadata?: any;
  createdAt: string;
  tempId?: string;
  status?: 'sending' | 'sent' | 'failed' | 'local';
}

// ==================== CONTEXT ====================

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (msg: string, metadata?: any) => void;
  isConnected: boolean;
  isTyping: { admin: boolean; ai: boolean };
  conversationId: number | null;
  sessionId: string | null;
  loadMessages: () => Promise<void>;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatBox');
  return context;
};

// ==================== CHATBOX COMPONENT ====================

export default function ChatBox() {
  const queryClient = useQueryClient();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState({ admin: false, ai: false });
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [input, setInput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousLengthRef = useRef(0);
  const isUserAtBottom = useRef(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pendingMessagesRef = useRef<Set<string>>(new Set());
  const isLoadingMessagesRef = useRef(false);
  const sendAiMessageRef = useRef<((msg: string, targetConversationId?: number | null) => Promise<void>) | null>(null);
  const [aiTypingDots, setAiTypingDots] = useState('');
  const [hasAttemptedInitialLoad, setHasAttemptedInitialLoad] = useState(false);

  const tenantId = Number(process.env.NEXT_PUBLIC_TENANT_ID || '1');
  const localUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const userIdNumber = localUserId ? Number(localUserId) : null;
  const { data: aiChatEnabled } = useGetAiChatEnabled();
  const { data: dbConversationIds = [] } = useUserConversationIds({
    userId: userIdNumber!,
    tenantId,
    enabled: !!userIdNumber,
  });
  const saveBotMessage = useSaveBotMessage();
  const { 
    data: aiConfig, 
    isLoading, 
    error,
    isError 
  } = useTenantAIConfig(tenantId)

  const textPromptAi = useMemo(() => {
    return aiConfig?.aiSystemPrompt?.text || '';
  }, [aiConfig?.aiSystemPrompt?.text]);

  useEffect(() => {
    if (textPromptAi) {
      console.log("✅ System Prompt loaded:", textPromptAi.substring(0, 100) + "...");
    }
  }, [textPromptAi]);

  // Hiệu ứng typing dots cho AI
  useEffect(() => {
    if (!isTyping.ai) {
      setAiTypingDots('');
      return;
    }

    const interval = setInterval(() => {
      setAiTypingDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isTyping.ai]);

  const latestConversationId = dbConversationIds[0] ?? null;
  const AI_URL = process.env.NEXT_PUBLIC_AI_URL!;
  const { data: currentUser } = useCurrent();
  const [isGuest, setIsGuest] = useState(false);
  const { data: products = [], isLoading: isLoadingProducts } = useAllProducts()

  // Ref để lưu tin nhắn local khi chưa login
  const localMessagesRef = useRef<ChatMessage[]>([]);

  // ==================== HELPER FUNCTIONS ====================

  const findProductsByKeyword = useCallback((keyword: string) => {
    if (!products.length) return [];
    
    const lowerKeyword = keyword.toLowerCase().trim();
    
    const keywordMappings: { [key: string]: string[] } = {
      'áo': ['áo', 'thun', 'sơ mi', 'áo nam', 'áo nữ'],
      'quần': ['quần', 'jeans', 'tây', 'short'],
      'giày': ['giày', 'dép', 'sandal'],
      'phụ kiện': ['phụ kiện', 'túi', 'mũ', 'ví', 'thắt lưng'],
      'găng tay': ['găng tay', 'gang tay', 'bao tay'],
      'vớ': ['vớ', 'tất', 'vo'],
    };

    let searchKeywords = [lowerKeyword];
    Object.entries(keywordMappings).forEach(([mainKeyword, synonyms]) => {
      if (synonyms.some(syn => lowerKeyword.includes(syn))) {
        searchKeywords = [...searchKeywords, mainKeyword, ...synonyms];
      }
    });

    return products.filter((product: Product) => {
      const productName = product.name?.toLowerCase() || '';
      const productDesc = product.description?.toLowerCase() || '';
      const seoKeywords = product.seoKeywords?.toLowerCase() || '';

      const matches = searchKeywords.some(searchWord => 
        productName.includes(searchWord) || 
        productDesc.includes(searchWord) ||
        seoKeywords.includes(searchWord)
      );

      return matches;
    }).slice(0, 4);
  }, [products]);

  const renderMessageWithLinks = (message: string) => {
    if (!message) return message;

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(message)) !== null) {
      if (match.index > lastIndex) {
        parts.push(message.slice(lastIndex, match.index));
      }

      const linkText = match[1];
      const linkUrl = match[2];
      
      parts.push(
        <Link 
          key={match.index}
          href={`/${linkUrl}`}
          className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkText}
        </Link>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < message.length) {
      parts.push(message.slice(lastIndex));
    }

    return parts.length > 0 ? parts : message;
  };

  // ==================== AUTH & SESSION MANAGEMENT ====================

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isUserAuthenticated = currentUser && currentUser.id;
      
      console.log('🔐 Auth check:', {
        isUserAuthenticated: !!isUserAuthenticated,
        currentUserId: currentUser?.id,
        currentIsGuest: isGuest
      });
      
      if (!isUserAuthenticated) {
        // Guest mode
        let guestSessionId = localStorage.getItem('guestSessionId');
        if (!guestSessionId) {
          guestSessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('guestSessionId', guestSessionId);
        }
        
        if (sessionId !== guestSessionId) {
          setSessionId(guestSessionId);
        }
        if (!isGuest) {
          setIsGuest(true);
        }
        
        // Load tin nhắn local
        const savedLocalMessages = localStorage.getItem('localChatMessages');
        if (savedLocalMessages) {
          try {
            const parsedMessages = JSON.parse(savedLocalMessages);
            localMessagesRef.current = parsedMessages;
            setMessages(parsedMessages);
          } catch (e) {
            console.error('Error loading local messages:', e);
            localMessagesRef.current = [];
          }
        }
        
        console.log('🔍 User is GUEST, sessionId:', guestSessionId);
      } else {
        // User authenticated
        if (isGuest) {
          setIsGuest(false);
        }
        if (sessionId) {
          setSessionId(null);
        }
        
        localStorage.removeItem('guestSessionId');
        localStorage.removeItem('guestConversationId');
        
        console.log('🔍 User is AUTHENTICATED, userId:', currentUser.id);
        
        // Migrate messages sau khi đã chuyển trạng thái
        setTimeout(() => {
          if (localMessagesRef.current.length > 0) {
            migrateLocalMessagesToServer();
          }
        }, 1000);
      }
    }
  }, [currentUser]);

  // ==================== MESSAGE MANAGEMENT ====================

  const addMessage = useCallback((newMessage: ChatMessage) => {
    setMessages(prev => {
      const exists = prev.some(msg => 
        msg.id === newMessage.id || 
        (newMessage.tempId && msg.id === newMessage.tempId) ||
        (msg.tempId && msg.tempId === newMessage.tempId)
      );
      
      if (exists) {
        return prev.map(msg => {
          if (msg.id === newMessage.id || 
              (newMessage.tempId && msg.id === newMessage.tempId) ||
              (msg.tempId && msg.tempId === newMessage.tempId)) {
            return { ...newMessage, tempId: undefined };
          }
          return msg;
        });
      }
      
      const updated = [...prev, newMessage].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      return updated;
    });
  }, []);

  const updateMessageStatus = useCallback((tempId: string, newId: string | number, status: 'sent' | 'failed') => {
    if (status === 'failed') {
      console.log('🔄 Keeping message as sending instead of failed:', tempId);
      return;
    }
    
    setMessages(prev => 
      prev.map(msg => 
        msg.tempId === tempId 
          ? { ...msg, id: newId, tempId: undefined, status: 'sent' }
          : msg
      )
    );
  }, []);

  // ==================== LOAD MESSAGES ====================

  const loadMessages = useCallback(async () => {
    // Nếu là guest, không load từ server
    if (isGuest) {
      console.log('🎭 Guest mode - using local messages');
      return;
    }
    
    // QUAN TRỌNG: Chỉ load messages nếu có conversationId
    const targetConversationId = conversationId || latestConversationId;
    if (!targetConversationId) {
      console.log('⏳ No conversationId available - skipping message load');
      setHasAttemptedInitialLoad(true);
      return;
    }
    
    if (isLoadingMessagesRef.current) {
      console.log('⏳ Already loading messages - skipping');
      return;
    }
    
    console.log('🔄 Loading messages for conversation:', targetConversationId);
    
    isLoadingMessagesRef.current = true;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/messages?conversationId=${targetConversationId}`,
        {
          headers: { 'x-tenant-id': tenantId.toString() },
          cache: 'no-cache'
        }
      );
      
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      
      const loadedMessages = Array.isArray(data.messages) ? data.messages : [];
      console.log('📥 Loaded messages from server:', loadedMessages.length);
      
      const sortedMessages = loadedMessages.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      // QUAN TRỌNG: Thay thế toàn bộ messages bằng messages từ server
      setMessages(sortedMessages);
      setHasAttemptedInitialLoad(true);
      
    } catch (err) {
      console.error('❌ Load messages failed:', err);
      setHasAttemptedInitialLoad(true);
    } finally {
      isLoadingMessagesRef.current = false;
    }
  }, [conversationId, latestConversationId, tenantId, isGuest]);

  // ==================== AUTO LOAD MESSAGES WHEN CONVERSATION AVAILABLE ====================

  useEffect(() => {
    // Tự động load messages khi có conversationId và user đã login
    if (currentUser?.id && !isGuest && conversationId && !hasAttemptedInitialLoad) {
      console.log('🔄 Auto-loading messages for conversation:', conversationId);
      
      // Đợi một chút để đảm bảo socket đã kết nối
      const timer = setTimeout(() => {
        loadMessages();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser?.id, isGuest, conversationId, loadMessages, hasAttemptedInitialLoad]);

  // Lưu tin nhắn local vào localStorage
  const saveLocalMessages = useCallback((messages: ChatMessage[]) => {
    if (typeof window === 'undefined') return;
    
    // Chỉ lưu tin nhắn có status 'local'
    const localMessages = messages.filter(msg => msg.status === 'local');
    localStorage.setItem('localChatMessages', JSON.stringify(localMessages));
    localMessagesRef.current = localMessages;
  }, []);

  // Chuyển đổi tin nhắn local thành tin nhắn thật khi login
  const migrateLocalMessagesToServer = useCallback(async () => {
    if (!currentUser?.id || !conversationId || localMessagesRef.current.length === 0) return;
    
    console.log('🔄 Migrating local messages to server:', localMessagesRef.current.length);
    
    for (const localMsg of localMessagesRef.current) {
      if (localMsg.senderType === 'GUEST' || localMsg.senderType === 'USER') {
        // Gửi lại tin nhắn user qua socket
        if (socket?.connected) {
          const tempId = `migrate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          socket.emit('send:message', {
            message: localMsg.message,
            tempId: tempId,
            metadata: localMsg.metadata,
            conversationId: conversationId,
            senderType: 'USER',
            senderId: currentUser.id,
            sessionId: null,
            tenantId: tenantId
          });
        }
      } else if (localMsg.senderType === 'BOT' || localMsg.senderType === 'AI') {
        // Lưu tin nhắn bot vào database
        saveBotMessage.mutate({ 
          conversationId: Number(conversationId),
          message: localMsg.message, 
          sessionId: null
        });
      }
    }
    
    // Xóa tin nhắn local sau khi migrate
    localStorage.removeItem('localChatMessages');
    localMessagesRef.current = [];
    
    // Reload messages từ server
    setTimeout(() => loadMessages(), 1000);
  }, [currentUser, conversationId, socket, tenantId, saveBotMessage, loadMessages]);

  // ==================== CONVERSATION INITIALIZATION ====================

  useEffect(() => {
    console.log('🔄 Conversation init check:', {
      currentUser: currentUser?.id,
      isConnected,
      conversationId,
      dbConversationIds: dbConversationIds.length,
      hasAttemptedInitialLoad
    });

    // Chỉ xử lý khi user đã login và socket connected
    if (!currentUser?.id || !isConnected || conversationId) {
      return;
    }

    console.log('🚀 Initializing conversation...');

    // Ưu tiên dùng conversation từ database
    if (dbConversationIds.length > 0) {
      const existingConvId = dbConversationIds[0];
      console.log('👤 Using existing conversation:', existingConvId);
      setConversationId(existingConvId);
      
      // Join conversation và load messages
      if (socket?.connected) {
        socket.emit('join:conversation', existingConvId);
      }
      
      // Load messages sau khi set conversationId
      setTimeout(() => loadMessages(), 300);
    } else {
      console.log('📝 No existing conversation - will create on first message');
      // QUAN TRỌNG: Đánh dấu đã thử load để không bị kẹt ở trạng thái loading
      setHasAttemptedInitialLoad(true);
    }
  }, [currentUser?.id, isConnected, conversationId, dbConversationIds, socket, loadMessages, hasAttemptedInitialLoad]);


const { sendAiMessage } = useAiMessage({
  conversationId,
  sessionId,
  currentUser,
  addMessage,
  saveBotMessage,
  textPromptAi,
  findProductsByKeyword,
  isGuest,
  setMessages,
  setIsTyping,
  tenantId
});


  useEffect(() => {
    sendAiMessageRef.current = sendAiMessage;
  }, [sendAiMessage]);

  // ==================== SOCKET MANAGEMENT ====================

  useEffect(() => {
    console.log('🔌 Socket effect running:', {
      currentUser: currentUser?.id,
      isGuest,
      shouldConnect: currentUser?.id && !isGuest
    });

    // QUAN TRỌNG: Chỉ kết nối socket khi có user thật
    const shouldConnectSocket = currentUser?.id && !isGuest;
    
    if (!shouldConnectSocket) {
      console.log('🎭 Guest mode or no user - Socket disabled');
      setIsConnected(false);
      if (socket) {
        console.log('🔌 Disconnecting existing socket');
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    console.log('👤 User detected, creating socket...', currentUser.id);

    const socketInstance = getSocket({ 
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    if (!socketInstance) {
      console.log('❌ Cannot get socket instance');
      return;
    }
    
    setSocket(socketInstance);

    const onConnect = () => {
      setIsConnected(true);
      console.log('✅ Socket connected - User:', currentUser.id);
      
      // QUAN TRỌNG: Load messages ngay sau khi kết nối
      if (conversationId) {
        console.log('🔄 Loading messages for conversation:', conversationId);
        loadMessages();
      } else if (latestConversationId) {
        console.log('🔄 Loading messages for latest conversation:', latestConversationId);
        setConversationId(latestConversationId);
        setTimeout(() => loadMessages(), 300);
      } else {
        // Nếu không có conversation nào, đánh dấu đã thử load
        setHasAttemptedInitialLoad(true);
      }
    };

    const onDisconnect = (reason: string) => {
      setIsConnected(false);
      console.log('❌ Socket disconnected:', reason);
    };

    const onConnectError = (error: any) => {
      console.error('🔴 Socket connection error:', error);
      setIsConnected(false);
    };

    const onSession = (data: { sessionId: string }) => {
      setSessionId(data.sessionId);
      localStorage.setItem('sessionId', data.sessionId);
      console.log('🔑 Session initialized:', data.sessionId);
    };

    const onConvUpdate = (data: any) => {
      const id = data.conversationId || data.id;
      if (id && id !== conversationId) {
        console.log('🔄 Conversation updated:', id);
        setConversationId(id);
        localStorage.setItem('conversationId', id.toString());
        
        if (socketInstance.connected) {
          socketInstance.emit('join:conversation', id);
        }
      }
    };

    const onConversationCreated = (data: any) => {
      console.log('✅ Conversation created event:', data);
      const newConversationId = data.conversationId || data.id;
      if (newConversationId) {
        setConversationId(newConversationId);
        localStorage.setItem('conversationId', newConversationId.toString());
        
        if (socketInstance.connected) {
          socketInstance.emit('join:conversation', newConversationId);
        }
        
        setTimeout(() => loadMessages(), 300);
      }
    };

    const onMessage = (msg: ChatMessage & { tempId?: string }) => {
      console.log('📨 onMessage received:', { 
        tempId: msg.tempId, 
        senderType: msg.senderType, 
        conversationId: msg.conversationId 
      });
      
      if (msg.tempId && pendingMessagesRef.current.has(msg.tempId)) {
        console.log('✅ Message confirmation received:', msg.tempId);
        pendingMessagesRef.current.delete(msg.tempId);
        updateMessageStatus(msg.tempId, msg.id, 'sent');
        
        if (aiChatEnabled && ['USER', 'GUEST'].includes(msg.senderType)) {
          console.log('🤖 Triggering AI response after user message confirmed');
          setTimeout(() => {
            sendAiMessageRef.current?.(msg.message, msg.conversationId);
          }, 500);
        }
      } else {
        console.log('💬 New message from backend');
        addMessage(msg);
      }
    };

    const onMessageConfirmed = (data: { tempId: string; messageId: string | number }) => {
      console.log('✅ Message confirmed:', data.tempId, '->', data.messageId);
      if (pendingMessagesRef.current.has(data.tempId)) {
        pendingMessagesRef.current.delete(data.tempId);
        setMessages(prev => 
          prev.map(msg => 
            msg.tempId === data.tempId 
              ? { ...msg, id: data.messageId, tempId: undefined, status: 'sent' }
              : msg
          )
        );
      }
    };

    const onMessageFailed = (data: { tempId: string; error?: string }) => {
      console.log('❌ Message failed:', data.tempId, data.error);
      if (pendingMessagesRef.current.has(data.tempId)) {
        pendingMessagesRef.current.delete(data.tempId);
        setMessages(prev => 
          prev.map(msg => 
            msg.tempId === data.tempId 
              ? { ...msg, status: 'failed' as const }
              : msg
          )
        );
      }
    };

    const onTyping = ({ userId, isTyping }: { userId: number; isTyping: boolean }) => {
      setIsTyping(prev => ({ ...prev, admin: isTyping }));
      if (isTyping) {
        setTimeout(() => setIsTyping(prev => ({ ...prev, admin: false })), 3000);
      }
    };

    // Register events
    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('connect_error', onConnectError);
    socketInstance.on('session-initialized', onSession);
    socketInstance.on('conversation-updated', onConvUpdate);
    socketInstance.on('conversation:created', onConversationCreated);
    socketInstance.on('message', onMessage);
    socketInstance.on('message:confirmed', onMessageConfirmed);
    socketInstance.on('message:failed', onMessageFailed);
    socketInstance.on('typing', onTyping);

    // Kết nối socket
    console.log('🔌 Connecting socket...');
    socketInstance.connect();

    return () => {
      console.log('🧹 Cleaning up socket events');
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off('connect_error', onConnectError);
      socketInstance.off('session-initialized', onSession);
      socketInstance.off('conversation-updated', onConvUpdate);
      socketInstance.off('conversation:created', onConversationCreated);
      socketInstance.off('message', onMessage);
      socketInstance.off('message:confirmed', onMessageConfirmed);
      socketInstance.off('message:failed', onMessageFailed);
      socketInstance.off('typing', onTyping);
    };
  }, [currentUser?.id, isGuest, conversationId, latestConversationId, loadMessages]);

  // ==================== SEND MESSAGE ====================

  const sendMessage = useCallback((message: string, metadata?: any) => {
    if (!message.trim()) {
      console.log('❌ Cannot send message: empty message');
      return;
    }

    console.log('🔍 Sending message - isGuest:', isGuest, 'currentUser:', currentUser?.id);

    const tempId = `temp-${Date.now()}`;
    const senderType = currentUser && currentUser.id ? 'USER' : 'GUEST';
    const senderId = currentUser?.id || null;

    // Nếu là GUEST -> chỉ lưu local
    if (isGuest) {
      console.log('🎭 Guest mode - saving message locally');
      
      const userMsg: ChatMessage = {
        id: tempId,
        senderType: 'GUEST',
        senderId: null,
        message: message.trim(),
        conversationId: null,
        sessionId: sessionId,
        createdAt: new Date().toISOString(),
        tempId,
        status: 'local',
        metadata: {
          ...metadata,
          isGuest: true,
          guestSessionId: sessionId
        },
      };

      addMessage(userMsg);
      
      // Lưu vào localStorage
      const updatedMessages = [...messages.filter(msg => msg.id !== tempId), userMsg];
      saveLocalMessages(updatedMessages);
      
      // Gọi AI response nếu enabled
      if (aiChatEnabled) {
        setTimeout(() => {
          sendAiMessageRef.current?.(message.trim(), null);
        }, 300);
      }
      
      setInput('');
      return;
    }

    // Nếu là USER đã login
    if (!socket) {
      console.log('❌ Cannot send message: no socket');
      return;
    }

    // QUAN TRỌNG: Nếu chưa có conversationId, backend sẽ tự động tạo
    const effectiveConversationId = conversationId || latestConversationId;
    
    console.log('📤 Preparing message with:', {
      hasConversationId: !!effectiveConversationId,
      conversationId: effectiveConversationId,
      socketConnected: socket.connected
    });

    const userMsg: ChatMessage = {
      id: tempId,
      senderType: 'USER',
      senderId: senderId,
      message: message.trim(),
      conversationId: effectiveConversationId || undefined,
      sessionId: null,
      createdAt: new Date().toISOString(),
      tempId,
      status: 'sending',
      metadata: {
        ...metadata,
        isGuest: false,
        userId: senderId,
        tenantId: tenantId
      },
    };

    addMessage(userMsg);
    pendingMessagesRef.current.add(tempId);

    const payload: any = {
      message: message.trim(), 
      tempId, 
      metadata: userMsg.metadata,
      senderType: 'USER',
      senderId,
      tenantId: tenantId,
      userId: senderId,
    };

    // QUAN TRỌNG: Gửi cả khi chưa có conversationId, backend sẽ xử lý
    if (effectiveConversationId) {
      payload.conversationId = effectiveConversationId;
    } else {
      console.log('🆕 No conversationId - backend will create one automatically');
    }

    console.log('📤 Emitting send:message:', payload);
    socket.emit('send:message', payload);
    
    // Fallback: Nếu backend không confirm sau 15s
    const timeoutId = setTimeout(() => {
      if (pendingMessagesRef.current.has(tempId)) {
        console.warn('⏳ No confirmation from backend after 15s, marking as sent anyway');
        pendingMessagesRef.current.delete(tempId);
        setMessages(prev => 
          prev.map(msg => 
            msg.tempId === tempId 
              ? { ...msg, status: 'sent', tempId: undefined }
              : msg
          )
        );
        
        // Trigger AI response với conversationId hiện tại
        if (aiChatEnabled) {
          setTimeout(() => {
            const currentConvId = conversationId || latestConversationId;
            console.log('🤖 Triggering AI with conversationId:', currentConvId);
            sendAiMessageRef.current?.(message.trim(), currentConvId || undefined);
          }, 500);
        }
      }
    }, 15000);
    
    // Clear timeout khi message được confirm
    const messageConfirmCheckInterval = setInterval(() => {
      if (!pendingMessagesRef.current.has(tempId)) {
        clearTimeout(timeoutId);
        clearInterval(messageConfirmCheckInterval);
      }
    }, 100);
    
    setInput('');
  }, [socket, conversationId, latestConversationId, aiChatEnabled, currentUser, addMessage, isGuest, sessionId, messages, saveLocalMessages, tenantId]);

  // ==================== FALLBACK MESSAGE DISPLAY ====================

  useEffect(() => {
    // Fallback: Nếu socket không kết nối được nhưng có messages trong database, vẫn hiển thị
    if (currentUser?.id && !isGuest && messages.length === 0 && dbConversationIds.length > 0) {
      console.log('🔄 Fallback: Loading messages directly from database');
      
      const loadMessagesDirectly = async () => {
        try {
          const conversationIdToLoad = conversationId || dbConversationIds[0];
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/chat/messages?conversationId=${conversationIdToLoad}`,
            {
              headers: { 'x-tenant-id': tenantId.toString() },
              cache: 'no-cache'
            }
          );
          
          if (res.ok) {
            const data = await res.json();
            const loadedMessages = Array.isArray(data.messages) ? data.messages : [];
            if (loadedMessages.length > 0) {
              console.log('📥 Fallback loaded messages:', loadedMessages.length);
              setMessages(loadedMessages.sort((a: any, b: any) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              ));
            }
          }
        } catch (err) {
          console.error('❌ Fallback load messages failed:', err);
        }
      };

      // Thử load sau 3 giây nếu socket vẫn chưa kết nối
      const timer = setTimeout(() => {
        if (!isConnected) {
          loadMessagesDirectly();
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser?.id, isGuest, messages.length, dbConversationIds, conversationId, isConnected, tenantId]);

  // ==================== AUTO SAVE LOCAL MESSAGES ====================

  useEffect(() => {
    if (isGuest && messages.length > 0) {
      // Chỉ lưu những tin nhắn có status 'local'
      const localMessages = messages.filter(msg => msg.status === 'local');
      saveLocalMessages(localMessages);
    }
  }, [messages, isGuest, saveLocalMessages]);

  // ==================== SCROLL MANAGEMENT ====================

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop - clientHeight < 100;
      isUserAtBottom.current = atBottom;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isChatOpen]);

  useEffect(() => {
    if (isUserAtBottom.current) {
      scrollToBottom();
    }
  }, [messages, isTyping, scrollToBottom]);

  // ==================== UNREAD COUNT ====================

  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (!isChatOpen && messages.length > previousLengthRef.current) {
      const newMsgs = messages.slice(previousLengthRef.current);
      const newAdminOrBot = newMsgs.filter(m => 
        ['ADMIN', 'BOT'].includes(m.senderType) && m.status !== 'sending'
      ).length;
      setUnreadCount(prev => prev + newAdminOrBot);
    }
    previousLengthRef.current = messages.length;
  }, [messages, isChatOpen]);

  // ==================== UI HELPERS ====================

  const getBubbleClass = useCallback((msg: ChatMessage) => {
    const isOwn = ['USER', 'GUEST'].includes(msg.senderType);
    const base = 'max-w-[75%] rounded-2xl px-4 py-2.5 shadow-md text-sm transition-all duration-200';
    
    if (msg.status === 'sending') {
      return `${base} bg-gray-300 text-gray-600 opacity-80 rounded-br-none`;
    }
    
    if (msg.status === 'local') {
      return `${base} bg-indigo-500 text-white rounded-br-none opacity-90`;
    }
    
    if (isOwn) {
      return `${base} bg-indigo-600 text-white rounded-br-none`;
    }
    
    if (msg.senderType === 'ADMIN') {
      return `${base} bg-blue-600 text-white rounded-bl-none`;
    }
    
    if (msg.senderType === 'BOT') {
      return `${base} bg-green-600 text-white rounded-bl-none`;
    }
    
    return `${base} bg-gray-200 text-gray-800 rounded-bl-none`;
  }, []);

  const formatTime = useCallback((date: string) => 
    new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  , []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Helper function để hiển thị trạng thái - ĐÃ SỬA LỖI
  const getConnectionStatus = () => {
    if (isGuest) {
      return {
        text: 'Chế độ khách - Tin nhắn tạm thời',
        color: 'text-yellow-600',
        inputDisabled: false,
        placeholder: 'Nhập tin nhắn (lưu tạm thời)...'
      };
    }
    
    if (!currentUser?.id) {
      return {
        text: 'Đang kiểm tra đăng nhập...',
        color: 'text-gray-600', 
        inputDisabled: true,
        placeholder: 'Đang kiểm tra...'
      };
    }
    
    if (!isConnected) {
      return {
        text: 'Đang kết nối...',
        color: 'text-orange-600',
        inputDisabled: true,
        placeholder: 'Đang kết nối...'
      };
    }
    
    // QUAN TRỌNG: Đã sửa ở đây - không còn bị kẹt ở "đang tải hội thoại"
    if (!conversationId && !hasAttemptedInitialLoad) {
      return {
        text: 'Đang khởi tạo...',
        color: 'text-blue-600',
        inputDisabled: false, // Cho phép nhập tin nhắn ngay cả khi chưa có conversationId
        placeholder: 'Nhập tin nhắn để bắt đầu hội thoại...'
      };
    }
    
    // Nếu đã thử load và không có conversationId, vẫn cho phép nhập
    if (!conversationId && hasAttemptedInitialLoad) {
      return {
        text: 'Sẵn sàng - Chưa có hội thoại',
        color: 'text-green-600',
        inputDisabled: false,
        placeholder: 'Nhập tin nhắn để tạo hội thoại mới...'
      };
    }
    
    return {
      text: `Đã kết nối`,
      color: 'text-green-600',
      inputDisabled: false,
      placeholder: 'Nhập tin nhắn...'
    };
  };

  // ==================== CONTEXT VALUE ====================

  const contextValue = useMemo(() => ({
    messages,
    sendMessage,
    isConnected,
    isTyping,
    conversationId,
    sessionId,
    loadMessages,
    isChatOpen,
    setIsChatOpen
  }), [messages, sendMessage, isConnected, isTyping, conversationId, sessionId, loadMessages, isChatOpen]);

  // ==================== RENDER ====================

  const status = getConnectionStatus();

  return (
    <ChatContext.Provider value={contextValue}>
      {/* Floating Chat Button */}
      <div className="fixed bottom-5 right-5 z-[9999]">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="relative bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 flex items-center gap-2 font-medium"
        >
          <span className="text-2xl">💬</span>
          <span>Chat hổ trợ</span>
          {isGuest && (
            <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-md">
              🔄
            </span>
          )}
        </button>

        {!isGuest && !isConnected && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-white"></span>
        )}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-md animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-5 w-96 h-[600px] bg-white border border-gray-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9999] animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <div>
                <h3 className="font-bold text-lg">AI BOT</h3>
                <p className="text-xs flex items-center gap-1">
                  {isGuest ? (
                    <span className="text-yellow-300">Đăng nhập để lưu lịch sử chat</span>
                  ) : (
                    <>
                      <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></span>
                      {status.text}
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsChatOpen(false)} 
              className="text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 p-3 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 space-y-3"
          >
            {messages.length === 0 && !isTyping.admin && !isTyping.ai && (
              <div className="text-center text-gray-500 mt-8">
                <div className="text-5xl mb-3">
                  {currentUser ? '👋' : '🤖'}
                </div>
                <p className="text-sm font-medium mb-2">
                  {currentUser ? 'Chào bạn!' : 'Xin chào!'}
                </p>
                <p className="text-xs text-gray-600">
                  {currentUser 
                    ? 'Hỏi gì cũng được, AI và Admin luôn sẵn sàng!' 
                    : 'Tôi là AI hỗ trợ. Hãy chat với tôi!'
                  }
                </p>
                {/* Hiển thị trạng thái cho user mới */}
                {currentUser && !conversationId && (
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    💡 Nhập tin nhắn đầu tiên để tạo hội thoại mới
                  </p>
                )}
              </div>
            )}

            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex ${['USER', 'GUEST'].includes(msg.senderType) ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                <div className={getBubbleClass(msg)}>
                  {!['USER', 'GUEST'].includes(msg.senderType) && (
                    <div className="text-xs opacity-80 mb-1 font-semibold">
                      {msg.senderType === 'ADMIN' ? '👨‍💼 Admin' : msg.senderType === 'BOT' ? '🤖 AI' : 'Bạn'}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap break-words">
                    {renderMessageWithLinks(msg.message)}
                  </div>
                  <div className="text-xs mt-1 opacity-70 flex items-center gap-1">
                    {formatTime(msg.createdAt)}
                    {msg.status === 'sending' && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-current rounded-full opacity-60 animate-pulse"></span>
                        <span className="text-xs opacity-70">đang gửi...</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicators */}
            {isTyping.admin && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <div className="bg-blue-100 text-blue-800 rounded-2xl px-4 py-2 text-sm flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>Admin đang soạn tin...</span>
                </div>
              </div>
            )}

            {isTyping.ai && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <div className="bg-green-100 text-green-800 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-sm font-medium">AI đang suy nghĩ {aiTypingDots}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={status.placeholder}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status.inputDisabled}
                className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-50 transition"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || status.inputDisabled}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-full hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 font-medium shadow-md transition disabled:cursor-not-allowed flex items-center gap-2"
              >
                Gửi
              </button>
            </div>
            
          
          </div>
        </div>
      )}
    </ChatContext.Provider>
  );
}