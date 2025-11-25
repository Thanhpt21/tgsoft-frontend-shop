'use client';

import { useState, useEffect, useRef, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import { getSocket, type SocketType } from '@/lib/socket';
import { useQueryClient } from '@tanstack/react-query';
import { useUserConversationIds } from '@/hooks/chat/useUserConversationIds';
import { useGetAiChatEnabled } from '@/hooks/chat/useGetAiChatEnabled';
import { useSaveBotMessage } from '@/hooks/chat/useSaveBotMessage';

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
  status?: 'sending' | 'sent' | 'failed';
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
  const hasScrolledToBottom = useRef(true);
  const isUserAtBottom = useRef(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pendingMessagesRef = useRef<Set<string>>(new Set());
  const isLoadingMessagesRef = useRef(false);

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

  const latestConversationId = dbConversationIds[0] ?? null;
  const AI_URL = process.env.NEXT_PUBLIC_AI_URL!;

  // ==================== OPTIMIZED MESSAGE MANAGEMENT ====================

  const addMessage = useCallback((newMessage: ChatMessage) => {
    setMessages(prev => {
      // Kiểm tra trùng lặp dựa trên id và tempId
      const exists = prev.some(msg => 
        msg.id === newMessage.id || 
        (newMessage.tempId && msg.id === newMessage.tempId) ||
        (msg.tempId && msg.tempId === newMessage.tempId)
      );
      
      if (exists) {
        // Cập nhật tin nhắn đã tồn tại
        return prev.map(msg => {
          if (msg.id === newMessage.id || 
              (newMessage.tempId && msg.id === newMessage.tempId) ||
              (msg.tempId && msg.tempId === newMessage.tempId)) {
            return { ...newMessage, tempId: undefined }; // Xóa tempId sau khi confirm
          }
          return msg;
        });
      }
      
      // Thêm tin nhắn mới và sắp xếp theo thời gian
      const updated = [...prev, newMessage].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      return updated;
    });
  }, []);

  const updateMessageStatus = useCallback((tempId: string, newId: string | number, status: 'sent' | 'failed') => {
    setMessages(prev => 
      prev.map(msg => 
        msg.tempId === tempId 
          ? { ...msg, id: newId, tempId: undefined, status }
          : msg
      )
    );
  }, []);

  // ==================== LOAD MESSAGES ====================

  const loadMessages = useCallback(async () => {
    if (!conversationId || isLoadingMessagesRef.current) return;
    
    isLoadingMessagesRef.current = true;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/messages?conversationId=${conversationId}`, {
        headers: { 'x-tenant-id': tenantId.toString() },
        cache: 'no-cache'
      });
      
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      
      const loadedMessages = Array.isArray(data.messages) ? data.messages : [];
      const sortedMessages = loadedMessages.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      setMessages(sortedMessages);
    } catch (err) {
      console.error('Load messages failed:', err);
    } finally {
      isLoadingMessagesRef.current = false;
    }
  }, [conversationId, tenantId]);

  // ==================== SOCKET MANAGEMENT ====================

  useEffect(() => {
    const socketInstance = getSocket({ 
      reconnectionAttempts: 5, 
      reconnectionDelay: 2000 
    });
    
    if (!socketInstance) return;
    setSocket(socketInstance);

    const onConnect = () => {
      setIsConnected(true);
      if (conversationId) {
        socketInstance.emit('join:conversation', conversationId);
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onSession = (data: { sessionId: string }) => {
      setSessionId(data.sessionId);
      localStorage.setItem('sessionId', data.sessionId);
    };

    const onConvUpdate = (data: any) => {
      const id = data.conversationId || data.id;
      if (id && id !== conversationId) {
        setConversationId(id);
        localStorage.setItem('conversationId', id.toString());
        socketInstance.emit('join:conversation', id);
      }
    };

    const onMessage = (msg: ChatMessage & { tempId?: string }) => {
      // Nếu là tin nhắn từ server confirm tin nhắn tạm
      if (msg.tempId && pendingMessagesRef.current.has(msg.tempId)) {
        pendingMessagesRef.current.delete(msg.tempId);
        updateMessageStatus(msg.tempId, msg.id, 'sent');
      } else {
        // Tin nhắn mới từ người khác
        addMessage(msg);
      }
    };

    const onMessageConfirmed = (data: { tempId: string; messageId: string | number }) => {
      if (pendingMessagesRef.current.has(data.tempId)) {
        pendingMessagesRef.current.delete(data.tempId);
        updateMessageStatus(data.tempId, data.messageId, 'sent');
      }
    };

    const onMessageFailed = (data: { tempId: string }) => {
      if (pendingMessagesRef.current.has(data.tempId)) {
        pendingMessagesRef.current.delete(data.tempId);
        updateMessageStatus(data.tempId, data.tempId, 'failed');
      }
    };

    const onTyping = ({ userId, isTyping }: { userId: number; isTyping: boolean }) => {
      setIsTyping(prev => ({ ...prev, admin: isTyping }));
      if (isTyping) {
        setTimeout(() => setIsTyping(prev => ({ ...prev, admin: false })), 3000);
      }
    };

    // Đăng ký events
    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('session-initialized', onSession);
    socketInstance.on('conversation-updated', onConvUpdate);
    socketInstance.on('message', onMessage);
    socketInstance.on('message:confirmed', onMessageConfirmed);
    socketInstance.on('message:failed', onMessageFailed);
    socketInstance.on('typing', onTyping);

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off('session-initialized', onSession);
      socketInstance.off('conversation-updated', onConvUpdate);
      socketInstance.off('message', onMessage);
      socketInstance.off('message:confirmed', onMessageConfirmed);
      socketInstance.off('message:failed', onMessageFailed);
      socketInstance.off('typing', onTyping);
    };
  }, [conversationId, addMessage, updateMessageStatus]);

  // Auto join latest conversation
  useEffect(() => {
    if (latestConversationId && latestConversationId !== conversationId) {
      setConversationId(latestConversationId);
      localStorage.setItem('conversationId', latestConversationId.toString());
      if (socket?.connected) {
        socket.emit('join:conversation', latestConversationId);
        // Không load messages ngay lập tức, đợi component ready
        setTimeout(() => loadMessages(), 100);
      }
    }
  }, [latestConversationId, conversationId, socket, loadMessages]);

  // Load messages khi mở chat
  useEffect(() => {
    if (isChatOpen && conversationId && !isLoadingMessagesRef.current) {
      loadMessages();
    }
  }, [isChatOpen, conversationId, loadMessages]);

  // ==================== SEND MESSAGE OPTIMIZED ====================

  const sendAiMessage = async (msg: string) => {
    setIsTyping(prev => ({ ...prev, ai: true }));
    
    const aiTempId = `ai-temp-${Date.now()}`;
    const aiPendingMessage: ChatMessage = {
      id: aiTempId,
      senderType: 'BOT',
      message: '...', // Placeholder
      conversationId,
      sessionId,
      createdAt: new Date().toISOString(),
      tempId: aiTempId,
      status: 'sending'
    };
    
    addMessage(aiPendingMessage);

    try {
      const token = localStorage.getItem('access_token_ai');
      if (!token) throw new Error('No AI token');

      const res = await fetch(`${AI_URL}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ prompt: msg }),
      });

      if (!res.ok) throw new Error('AI failed');
      const data = await res.json();
      const aiText = data.response?.text || 'Xin lỗi, tôi không thể trả lời ngay lúc này.';

      // Cập nhật tin nhắn AI
      setMessages(prev => 
        prev.map(msg => 
          msg.tempId === aiTempId 
            ? {
                ...msg,
                id: `ai-${Date.now()}`,
                message: aiText,
                tempId: undefined,
                status: 'sent'
              }
            : msg
        )
      );

      // Lưu vào database
      saveBotMessage.mutate({ 
        conversationId, 
        message: aiText, 
        sessionId 
      });
    } catch (err) {
      // Cập nhật trạng thái lỗi
      setMessages(prev => 
        prev.map(msg => 
          msg.tempId === aiTempId 
            ? {
                ...msg,
                message: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
                tempId: undefined,
                status: 'failed'
              }
            : msg
        )
      );
    } finally {
      setIsTyping(prev => ({ ...prev, ai: false }));
    }
  };

  const sendMessage = useCallback((message: string, metadata?: any) => {
    if (!message.trim() || !socket || !conversationId) return;

    const tempId = `temp-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: tempId,
      senderType: 'USER',
      message: message.trim(),
      conversationId,
      sessionId,
      createdAt: new Date().toISOString(),
      tempId,
      status: 'sending',
      metadata,
    };

    // Optimistic update - hiển thị ngay lập tức
    addMessage(userMsg);
    pendingMessagesRef.current.add(tempId);

    // Gửi qua socket
    socket.emit('send:message', { 
      conversationId, 
      message: message.trim(), 
      tempId, 
      metadata 
    });

    // Gửi AI message nếu enabled
    if (aiChatEnabled) {
      sendAiMessage(message.trim());
    }


    setInput('');
  }, [socket, conversationId, sessionId, aiChatEnabled, addMessage]);

      console.log("aiChatEnabled",aiChatEnabled)

  // ==================== SCROLL MANAGEMENT ====================

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Theo dõi scroll position
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
      isUserAtBottom.current = atBottom;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isChatOpen]);

  // Tự động scroll khi có tin nhắn mới và user đang ở cuối
  useEffect(() => {
    if (isUserAtBottom.current) {
      scrollToBottom();
    }
  }, [messages, isTyping, scrollToBottom]);

  // Reset unread count khi mở chat
  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  // Tính unread count
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
    
    if (msg.status === 'failed') {
      return `${base} bg-red-100 text-red-800 border border-red-300 rounded-br-none`;
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

  // ==================== MEMOIZED VALUES ====================

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

  return (
    <ChatContext.Provider value={contextValue}>
      {/* Floating Chat Button */}
      <div className="fixed bottom-5 right-5 z-[9999]">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="relative bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 flex items-center gap-2 font-medium"
        >
          <span className="text-2xl">💬</span>
          <span>Chat hỗ trợ</span>
        </button>

        {!isConnected && (
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
            <div>
              <h3 className="font-bold text-lg">Hỗ trợ & AI</h3>
              <p className="text-xs flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></span>
                {isConnected ? 'Đang kết nối' : 'Mất kết nối'}
              </p>
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
                <div className="text-5xl mb-3">👋</div>
                <p className="text-sm">Chào bạn! Hỏi gì cũng được, AI và Admin luôn sẵn sàng!</p>
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
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  <div className="text-xs mt-1 opacity-70 flex items-center gap-1">
                    {formatTime(msg.createdAt)}
                    {msg.status === 'sending' && (
                      <span className="w-2 h-2 bg-current rounded-full opacity-60"></span>
                    )}
                    {msg.status === 'failed' && (
                      <span className="text-red-500">❌</span>
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
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm font-medium">AI đang suy nghĩ...</span>
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
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!isConnected}
                className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-50 transition"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || !isConnected}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-full hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 font-medium shadow-md transition disabled:cursor-not-allowed"
              >
                Gửi
              </button>
            </div>
            {!isConnected && (
              <p className="text-xs text-red-500 mt-2 text-center animate-pulse">
                Đang kết nối lại...
              </p>
            )}
          </div>
        </div>
      )}
    </ChatContext.Provider>
  );
}