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
import { useAiMessage } from '@/hooks/chat/useAiMessage';
import { useUserChatStatus } from '@/hooks/user/useUserChatStatus';
import Image from 'next/image';

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
  isAiProcessing: boolean; // THÊM DÒNG NÀY
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatBox');
  return context;
};

// ==================== CHATBOX COMPONENT ====================

export default function ChatBox() {
  
  const TENANT_ID = Number(process.env.NEXT_PUBLIC_TENANT_ID)
  const queryClientRef = useRef(useQueryClient());
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

  // Thêm các state mới
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    hasMore: false,
    totalMessages: 0,
    isLoadingMore: false,
  });
  const isLoadingMoreRef = useRef(false);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const scrollObserverRef = useRef<IntersectionObserver | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const spinnerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tenantId = Number(process.env.NEXT_PUBLIC_TENANT_ID || '1');
  const localUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const userIdNumber = localUserId ? Number(localUserId) : null;
  const { data: aiChatEnabled } = useGetAiChatEnabled();
  const { data: dbConversationIds = [] } = useUserConversationIds({
    userId: userIdNumber!,
    tenantId,
    enabled: !!userIdNumber,
  });
  const latestConversationId = dbConversationIds[0] ?? null;
  const { data: currentUser } = useCurrent();
  const [isGuest, setIsGuest] = useState(false);
  const { data: products = [], isLoading: isLoadingProducts } = useAllProducts()
  const saveBotMessage = useSaveBotMessage();
  const { 
    data: aiConfig, 
    isLoading, 
    error,
    isError 
  } = useTenantAIConfig(tenantId)

  const { data: userChatStatus, isLoading: isLoadingChatStatus } = useUserChatStatus(
    currentUser?.id || 0, isChatOpen 
  );

  // Kiểm tra nếu chat bị tắt - CHỈ ÁP DỤNG CHO USER ĐÃ LOGIN
  const isChatDisabled = currentUser?.id && // Chỉ user đã login
                        userChatStatus?.data && 
                        !userChatStatus.data.chatEnabled;
  // KHÁCH (guest) LUÔN ĐƯỢC BẬT CHAT
  const computedIsGuest = !currentUser?.id;





  const textPromptAi = useMemo(() => {
    return aiConfig?.aiSystemPrompt?.text || '';
  }, [aiConfig?.aiSystemPrompt?.text]);

  useEffect(() => {
    if (textPromptAi) {
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                  (typeof window !== 'undefined' ? window.location.origin : 'https://demo.aiban.vn');

  let processed = message;
  
  // 1. XỬ LÝ URL TRỰC TIẾP TRƯỚC
  const directUrlPattern = /(https?:\/\/[^\s<>"]+)/gi;
  
  processed = processed.replace(directUrlPattern, (match, url) => {
    // Kiểm tra không phải là phần của thẻ HTML đã xử lý
    if (!processed.includes(`href="${url}"`)) {
      return `<a href="${url}" class="text-white-600 hover:text-white-800 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">${url}</a>`;
    }
    return match;
  });
  
  // 2. XỬ LÝ SLUG TRONG BACKTICKS - QUAN TRỌNG: KHÔNG GIỚI HẠN ĐỘ DÀI
  // Pattern: Bắt đầu bằng `, kết thúc bằng `, bên trong là ký tự chữ-số và dấu gạch ngang
  const backtickSlugPattern = /`([^`]+)`/gi;
  
  processed = processed.replace(backtickSlugPattern, (match, content) => {
    const cleanContent = content.trim();
    
    // KIỂM TRA XEM CÓ PHẢI SLUG KHÔNG:
    // 1. Có chứa dấu gạch ngang
    // 2. Chỉ chứa chữ, số, dấu gạch ngang
    // 3. Không chứa khoảng trắng
    const slugRegex = /^[a-z0-9\-]+$/i;
    
    if (slugRegex.test(cleanContent) && cleanContent.includes('-')) {
      // ĐÂY LÀ SLUG - GIỮ NGUYÊN TOÀN BỘ, KHÔNG CẮT BỚT
      const url = `${baseUrl}/san-pham/${cleanContent}`;
      return `<a href="${url}" class="text-white-600 hover:text-white-800 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">${cleanContent}</a>`;
    }
    
    // Nếu không phải slug, giữ nguyên backticks
    return match;
  });
  
  // 3. XỬ LÝ MARKDOWN LINK: [text](slug)
  const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/gi;
  
  processed = processed.replace(markdownLinkPattern, (match, text, slug) => {
    const cleanSlug = slug.trim();
    
    // Kiểm tra nếu là URL đầy đủ
    if (cleanSlug.startsWith('http')) {
      return `<a href="${cleanSlug}" class="text-blue-600 hover:text-blue-800 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    
    // Kiểm tra nếu là slug
    const slugRegex = /^[a-z0-9\-]+$/i;
    if (slugRegex.test(cleanSlug) && cleanSlug.includes('-')) {
      const url = `${baseUrl}/san-pham/${cleanSlug}`;
      return `<a href="${url}" class="text-blue-600 hover:text-blue-800 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    
    return match;
  });
  
  // 4. Xử lý line breaks
  processed = processed.replace(/\n/g, '<br/>');
  

  return (
    <div 
      className="whitespace-pre-wrap break-words text-sm md:text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
};


  // ==================== AUTH & SESSION MANAGEMENT ====================

useEffect(() => {
    if (typeof window !== 'undefined') {
      const isUserAuthenticated = currentUser && currentUser.id;
      
      
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
        
      } else {
        
        if (isGuest) {
          setIsGuest(false);
        }
        if (sessionId) {
          setSessionId(null);
        }
        
        // ✅ XÓA TẤT CẢ TIN NHẮN CŨ KHI LOGIN
        setMessages([]);
        localMessagesRef.current = [];
        
        // ✅ RESET flag để có thể load messages mới
        setHasAttemptedInitialLoad(false);
        
        // Xóa localStorage
        // localStorage.removeItem('guestSessionId');
        // localStorage.removeItem('guestConversationId');
        // localStorage.removeItem('localChatMessages');
        
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
      
      // Tin nhắn mới thêm vào cuối và sắp xếp theo thời gian
    const updated = [...prev, newMessage].sort((a, b) => {
      // Sắp xếp theo ID nếu có
      if (a.id && b.id && typeof a.id === 'number' && typeof b.id === 'number') {
        return a.id - b.id;
      }
      // Hoặc sắp xếp theo thời gian
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    
    return updated;

    });
  }, []);

  const updateMessageStatus = useCallback((tempId: string, newId: string | number, status: 'sent' | 'failed') => {
    if (status === 'failed') {
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

const loadMessages = useCallback(async (loadMore = false) => {
  if (isGuest) {
    return;
  }
  
  const targetConversationId = conversationId || latestConversationId;
  if (!targetConversationId) {
    setHasAttemptedInitialLoad(true);
    return;
  }
  
  // Nếu đang load more, sử dụng isLoadingMoreRef
  if (loadMore) {
    if (isLoadingMoreRef.current || !pagination.hasMore) return;
    
    // Hiển thị spinner ngay lập tức
    setShowLoadingSpinner(true);
    setPagination(prev => ({ ...prev, isLoadingMore: true }));
    isLoadingMoreRef.current = true;
    
    // Set timeout để spinner hiển thị đúng 3s (hoặc lâu hơn nếu API chậm)
    if (spinnerTimeoutRef.current) {
      clearTimeout(spinnerTimeoutRef.current);
    }
    spinnerTimeoutRef.current = setTimeout(() => {
      setShowLoadingSpinner(false);
    }, 3000); // 🆕 Sửa từ 1500ms thành 3000ms (3 giây)
    
  } else {
    if (isLoadingMessagesRef.current) return;
    isLoadingMessagesRef.current = true;
  }
  
  try {
    const currentPage = loadMore ? pagination.page + 1 : 1;
    const queryParams = new URLSearchParams({
      conversationId: targetConversationId.toString(),
      page: currentPage.toString(),
      pageSize: pagination.pageSize.toString(),
    });

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/messages?${queryParams}`,
      {
        headers: { 'x-tenant-id': tenantId.toString() },
        cache: 'no-cache',
      }
    );
    
    if (!res.ok) throw new Error('Failed to load messages');
    const data = await res.json();
    
    const loadedMessages = Array.isArray(data.messages) ? data.messages : [];

    if (loadMore) {
      // 🆕 THÊM: Delay 500ms để tạo hiệu ứng mượt mà
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Khi load more: thêm messages vào đầu
      setMessages(prev => {
        // Lọc bỏ tin nhắn trùng lặp
        const newMessages = loadedMessages.filter(
          (newMsg: any) => !prev.some(existingMsg => existingMsg.id === newMsg.id)
        );
        // Sắp xếp lại: cũ nhất → mới nhất
        return [...newMessages, ...prev].sort((a, b) => a.id - b.id);
      });
      
      // Cập nhật pagination state
      setPagination(prev => ({
        ...prev,
        page: currentPage,
        hasMore: data.pagination?.hasMore || false,
        totalMessages: data.pagination?.total || prev.totalMessages,
        isLoadingMore: false,
      }));
      
      // Ẩn spinner sau khi load xong (nếu chưa hết 3s)
      if (spinnerTimeoutRef.current) {
        clearTimeout(spinnerTimeoutRef.current);
      }
      setShowLoadingSpinner(false);
      
    } else {
      // Load ban đầu: set messages mới
      const sortedMessages = loadedMessages.sort((a: any, b: any) => a.id - b.id);
      setMessages(sortedMessages);
      setHasAttemptedInitialLoad(true);
      
      // Cập nhật pagination state
      setPagination({
        page: 1,
        pageSize: pagination.pageSize,
        hasMore: data.pagination?.hasMore || false,
        totalMessages: data.pagination?.total || 0,
        isLoadingMore: false,
      });
    }
    
  } catch (err) {
    console.error('❌ Load messages failed:', err);
    if (!loadMore) {
      setHasAttemptedInitialLoad(true);
    }
    setPagination(prev => ({ ...prev, isLoadingMore: false }));
    
    // Ẩn spinner khi có lỗi
    if (spinnerTimeoutRef.current) {
      clearTimeout(spinnerTimeoutRef.current);
    }
    setShowLoadingSpinner(false);
    
  } finally {
    if (loadMore) {
      isLoadingMoreRef.current = false;
    } else {
      isLoadingMessagesRef.current = false;
    }
  }
}, [conversationId, latestConversationId, tenantId, isGuest, pagination.page, pagination.pageSize, pagination.hasMore]);

// Cleanup spinner timeout
useEffect(() => {
  return () => {
    if (spinnerTimeoutRef.current) {
      clearTimeout(spinnerTimeoutRef.current);
    }
  };
}, []);

// Setup Intersection Observer cho infinite scroll
useEffect(() => {
  if (!topSentinelRef.current || !pagination.hasMore || pagination.isLoadingMore) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      // Khi top sentinel xuất hiện và có thể load more
      if (entry.isIntersecting && pagination.hasMore && !pagination.isLoadingMore) {
        loadMessages(true);
      }
    },
    { 
      root: chatContainerRef.current,
      rootMargin: '50px', // Trigger sớm hơn 50px
      threshold: 0.1,
    }
  );

  observer.observe(topSentinelRef.current);
  scrollObserverRef.current = observer;

  return () => {
    if (scrollObserverRef.current) {
      scrollObserverRef.current.disconnect();
    }
  };
}, [pagination.hasMore, pagination.isLoadingMore, loadMessages]);

// Thêm hàm load more khi scroll
const handleLoadMore = useCallback(() => {
  if (pagination.hasMore && !pagination.isLoadingMore) {
    loadMessages(true);
  }
}, [pagination.hasMore, pagination.isLoadingMore, loadMessages]);

  // ==================== AUTO LOAD MESSAGES WHEN CONVERSATION AVAILABLE ====================

  useEffect(() => {
    // Tự động load messages khi có conversationId và user đã login
    if (currentUser?.id && !isGuest && conversationId && !hasAttemptedInitialLoad) {
      
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

    // Chỉ xử lý khi user đã login và socket connected
    if (!currentUser?.id || !isConnected || conversationId) {
      return;
    }

    // Ưu tiên dùng conversation từ database
    if (dbConversationIds.length > 0) {
      const existingConvId = dbConversationIds[0];
      setConversationId(existingConvId);
      
      // Join conversation và load messages
      if (socket?.connected) {
        socket.emit('join:conversation', existingConvId);
      }
      
      // Load messages sau khi set conversationId
      setTimeout(() => loadMessages(), 300);
    } else {
      // QUAN TRỌNG: Đánh dấu đã thử load để không bị kẹt ở trạng thái loading
      setHasAttemptedInitialLoad(true);
    }
  }, [currentUser?.id, isConnected, conversationId, dbConversationIds, socket, loadMessages, hasAttemptedInitialLoad]);

  // ==================== AI MESSAGE HOOK ====================

  // SỬA: Lấy cả isAiProcessing từ hook
  const { sendAiMessage, isAiProcessing } = useAiMessage({
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
  });

  useEffect(() => {
    sendAiMessageRef.current = (msg: string, convId?: number | null) => {
      // Truyền current messages vào sendAiMessage
      return sendAiMessage(msg, convId, messages);
    };
  }, [sendAiMessage, messages]);

  // ==================== SOCKET MANAGEMENT ====================

  

  useEffect(() => {
    // QUAN TRỌNG: Chỉ kết nối socket khi có user thật
    const shouldConnectSocket = currentUser?.id && !isGuest;
    
    if (!shouldConnectSocket) {
      setIsConnected(false);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }


    const socketInstance = getSocket({ 
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    if (!socketInstance) {
      return;
    }
    
    setSocket(socketInstance);

    const onConnect = () => {
      setIsConnected(true);
      
      // QUAN TRỌNG: Load messages ngay sau khi kết nối
      if (conversationId) {
        loadMessages();
      } else if (latestConversationId) {
        setConversationId(latestConversationId);
        setTimeout(() => loadMessages(), 300);
      } else {
        // Nếu không có conversation nào, đánh dấu đã thử load
        setHasAttemptedInitialLoad(true);
      }
    };

    const onDisconnect = (reason: string) => {
      setIsConnected(false);
    };

    const onConnectError = (error: any) => {
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
        
        if (socketInstance.connected) {
          socketInstance.emit('join:conversation', id);
        }
      }
    };

    const onConversationCreated = (data: any) => {
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

    const onMessage = async (msg: ChatMessage & { tempId?: string }) => {
      if (msg.tempId && pendingMessagesRef.current.has(msg.tempId)) {
        pendingMessagesRef.current.delete(msg.tempId);
        updateMessageStatus(msg.tempId, msg.id, 'sent');

          setTimeout(() => {
            if (isUserAtBottom.current) {
              scrollToBottom('smooth');
            }
          }, 150);

        let shouldTriggerAI = false;
        try {
          await queryClientRef.current.refetchQueries({
            queryKey: ['chat', 'ai-enabled', TENANT_ID],
          });
          
          const freshAiStatus = queryClientRef.current.getQueryData<boolean>(['chat', 'ai-enabled', TENANT_ID]);
          // 🔥 FIX: Explicit check for undefined
          shouldTriggerAI = (freshAiStatus !== undefined ? freshAiStatus : false) && 
                          ['USER', 'GUEST'].includes(msg.senderType);
          
        } catch (error) {
          // 🔥 FIX: Explicit check for undefined
          shouldTriggerAI = (aiChatEnabled !== undefined ? aiChatEnabled : false) && 
                          ['USER', 'GUEST'].includes(msg.senderType);
          console.warn('❌ Refetch AI status failed, using cached:', aiChatEnabled);
        }
        
        if (shouldTriggerAI) {
          setTimeout(() => {
            sendAiMessageRef.current?.(msg.message, msg.conversationId);
          }, 500);
        }
      } else {
        addMessage(msg);
          setTimeout(() => {
            if (isUserAtBottom.current) {
              scrollToBottom('smooth');
            }
          }, 100);
      }
    };


    const onMessageConfirmed = (data: { tempId: string; messageId: string | number }) => {
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
    socketInstance.connect();

    return () => {
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

  const sendMessage = useCallback(async  (message: string, metadata?: any) => {
    // THÊM: Kiểm tra nếu AI đang xử lý thì không cho gửi
    if (isAiProcessing) {
      return;
    }

    if (!message.trim()) {
      return;
    }
     let latestAiEnabled = aiChatEnabled;
    try {
    const result = await queryClientRef.current.refetchQueries({
      queryKey: ['chat', 'ai-enabled', TENANT_ID],
    });
    
    // Lấy data mới nhất từ cache sau khi refetch
    const freshData = queryClientRef.current.getQueryData<boolean>(['chat', 'ai-enabled', TENANT_ID]);
    if (freshData !== undefined) {
      latestAiEnabled = freshData;
    }
  
  } catch (error) {
    console.warn('Failed to refetch AI status, using cached:', aiChatEnabled);
  }

    const tempId = `temp-${Date.now()}`;
    const senderType = currentUser && currentUser.id ? 'USER' : 'GUEST';
    const senderId = currentUser?.id || null;

    //Đảm bảo scroll xuống trước khi gửi tin nhắn mới
    isUserAtBottom.current = true;
    setTimeout(() => {
      scrollToBottom('smooth');
    }, 50);

    // Nếu là GUEST -> chỉ lưu local
    if (isGuest) {
      
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
      // Scroll xuống sau khi thêm tin nhắn
      setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
      
      // Gọi AI response nếu enabled
      if (latestAiEnabled) {
        setTimeout(() => {
          sendAiMessageRef.current?.(message.trim(), null);
        }, 300);
      }
      
      setInput('');
      return;
    }

    // Nếu là USER đã login
    if (!socket) {
      return;
    }

    // QUAN TRỌNG: Nếu chưa có conversationId, backend sẽ tự động tạo
    const effectiveConversationId = conversationId || latestConversationId;
    

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

    // 🔥 THÊM: Scroll xuống ngay sau khi thêm tin nhắn
    setTimeout(() => {
      scrollToBottom('smooth');
    }, 100);

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
    }

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
  }, [socket, conversationId, latestConversationId, aiChatEnabled, currentUser, addMessage, isGuest, sessionId, messages, saveLocalMessages, tenantId, isAiProcessing]); // THÊM isAiProcessing vào dependencies

  // ==================== FALLBACK MESSAGE DISPLAY ====================

  useEffect(() => {
    // Fallback: Nếu socket không kết nối được nhưng có messages trong database, vẫn hiển thị
    if (currentUser?.id && !isGuest && messages.length === 0 && dbConversationIds.length > 0) {
      
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
    messagesEndRef.current?.scrollIntoView({ 
      behavior,
      block: 'end',
      inline: 'nearest'
    });
  }, []);

  
    // 🔥 THÊM: Scroll khi AI bắt đầu typing
  useEffect(() => {
    if (isTyping.ai && isUserAtBottom.current) {
      setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
    }
  }, [isTyping.ai, scrollToBottom]);

  // 🔥 THÊM: Scroll khi AI kết thúc typing (có tin nhắn mới)
  useEffect(() => {
    if (!isTyping.ai && isUserAtBottom.current) {
      // Đợi một chút để tin nhắn AI được render
      setTimeout(() => {
        scrollToBottom('smooth');
      }, 300);
    }
  }, [isTyping.ai, scrollToBottom]);

  // auto-scroll khi có tin nhắn mới
  useEffect(() => {
  // Chỉ scroll khi:
  // 1. Có tin nhắn mới
  // 2. User đang ở gần bottom
  // 3. Chat window đang mở
  if (isChatOpen && isUserAtBottom.current) {
    // Thêm delay nhỏ để đảm bảo DOM đã update
    setTimeout(() => {
      scrollToBottom('smooth');
    }, 100);
  }
}, [messages, isTyping, isChatOpen, scrollToBottom]);
// Thêm ref cho timeout - SỬA KIỂU
type TimeoutId = ReturnType<typeof setTimeout>;
const loadMoreTimeoutRef = useRef<TimeoutId | null>(null);

useEffect(() => {
  const container = chatContainerRef.current;
  if (!container) return;

  // Cập nhật handleScroll
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Kiểm tra nếu ở gần bottom
    const scrollThreshold = 100;
    const atBottom = scrollHeight - scrollTop - clientHeight <= scrollThreshold;
    isUserAtBottom.current = atBottom;
    
    // Hiển thị nút scroll to bottom khi không ở bottom
    setShowScrollToBottom(!atBottom && scrollHeight > clientHeight * 1.5);
    
   // Load more khi scroll lên gần top (cách top 150px)
  const nearTop = scrollTop < 150;
    if (nearTop && pagination.hasMore && !pagination.isLoadingMore && !isGuest && conversationId) {
      // Debounce để tránh gọi nhiều lần
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
      }
      loadMoreTimeoutRef.current = setTimeout(() => {
        loadMessages(true);
      }, 500);
    }
    
    // Auto-scroll khi có tin nhắn mới và user đang ở bottom
    if (atBottom && messages.length > previousLengthRef.current) {
      setTimeout(() => scrollToBottom('smooth'), 100);
    }
    
    previousLengthRef.current = messages.length;
  };

  container.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    container.removeEventListener('scroll', handleScroll);
    // Cleanup timeout khi unmount
    if (loadMoreTimeoutRef.current) {
      clearTimeout(loadMoreTimeoutRef.current);
    }
  };
}, [messages.length, scrollToBottom, pagination.hasMore, pagination.isLoadingMore, isGuest, conversationId, loadMessages]); // Thêm dependencies

  // Setup Intersection Observer cho infinite scroll
useEffect(() => {
  if (!chatContainerRef.current || !topSentinelRef.current) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      // Khi top sentinel xuất hiện và có thể load more
      if (entry.isIntersecting && pagination.hasMore && !pagination.isLoadingMore) {
        loadMessages(true);
      }
    },
    { 
      root: chatContainerRef.current,
      rootMargin: '50px',
      threshold: 0.1,
    }
  );

  // Thêm delay để đảm bảo DOM đã render
  setTimeout(() => {
    if (topSentinelRef.current) {
      observer.observe(topSentinelRef.current);
      scrollObserverRef.current = observer;
    }
  }, 100);

  return () => {
    if (scrollObserverRef.current) {
      scrollObserverRef.current.disconnect();
    }
  };
}, [pagination.hasMore, pagination.isLoadingMore, loadMessages, chatContainerRef.current, topSentinelRef.current]); // Thêm dependencies

  useEffect(() => {
  // Reset pagination khi conversation thay đổi
    setPagination({
      page: 1,
      pageSize: 10,
      hasMore: false,
      totalMessages: 0,
      isLoadingMore: false,
    });
    setMessages([]);
    setHasAttemptedInitialLoad(false);
  }, [conversationId]);

  useEffect(() => {
    if (isUserAtBottom.current) {
      scrollToBottom();
    }
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isChatOpen && messages.length > 0) {
      // Đợi một chút để chat window render xong
      setTimeout(() => {
        scrollToBottom('instant');
        isUserAtBottom.current = true;
      }, 500);
    }
  }, [isChatOpen, scrollToBottom]);

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
  const base = 'max-w-[75%] rounded-2xl px-4 py-2.5 shadow-md text-sm transition-all duration-200 message-bubble';
  
  // Thêm class pulse cho tin nhắn mới gửi
  const isNew = msg.status === 'sending' || msg.status === 'local';
  const pulseClass = isNew ? 'bubble-pulse' : '';
  
  if (msg.status === 'sending') {
    return `${base} bg-gray-300 text-gray-600 opacity-80 rounded-br-none ${pulseClass}`;
  }
  
  if (msg.status === 'local') {
    return `${base} bg-indigo-500 text-white rounded-br-none opacity-90 ${pulseClass}`;
  }
  
  if (isOwn) {
    return `${base} bg-indigo-600 text-white rounded-br-none ${pulseClass}`;
  }
  
  if (msg.senderType === 'ADMIN') {
    return `${base} bg-green-500 text-white rounded-bl-none ${pulseClass}`;
  }
  
  if (msg.senderType === 'BOT') {
    return `${base} bg-green-500 text-white rounded-bl-none ${pulseClass}`;
  }
  
  return `${base} bg-gray-200 text-gray-800 rounded-bl-none ${pulseClass}`;
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
    // THÊM: Kiểm tra trạng thái AI processing
    if (isAiProcessing) {
      return {
        text: 'AI đang trả lời...',
        color: 'text-orange-600',
        inputDisabled: true,
        placeholder: 'Vui lòng đợi AI trả lời...'
      };
    }

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
    setIsChatOpen,
    isAiProcessing // THÊM: Đưa isAiProcessing vào context
  }), [messages, sendMessage, isConnected, isTyping, conversationId, sessionId, loadMessages, isChatOpen, isAiProcessing]);

  // ==================== RENDER ====================

  const status = getConnectionStatus();

  if (isChatDisabled && !computedIsGuest) {
    return null;
  }

  // Thêm hàm render loading spinner
const renderLoadingSpinner = () => {
  if (!showLoadingSpinner) return null;
  
  return (
    <div className="sticky top-0 z-20 bg-gradient-to-b from-white via-white/90 to-transparent pb-4">
      <div className="flex flex-col items-center justify-center py-4">
        {/* Animated spinner */}
        {/* <div className="relative w-12 h-12 mb-2">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-blue-300 border-b-transparent animate-spin-reverse"></div>
        </div> */}
        
        {/* Text với animation */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-sm font-medium text-blue-600 animate-pulse">
            Đang tải tin nhắn cũ...
          </div>
        </div>
        
        {/* Progress dots animation */}
        <div className="flex gap-1 mt-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

return (
  <ChatContext.Provider value={contextValue}>
    {/* Floating Chat Button - Màu xanh hiện đại */}
    <div className="fixed bottom-5 right-5 z-[9999]">
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="relative bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-3 md:px-6 md:py-3 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-medium touch-manipulation group"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
       <div className="relative">
          {/* Icon chat đẹp hơn */}
          <div className="relative z-10">
            <svg 
              className="w-6 h-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          
          {/* Hiệu ứng glow khi hover */}
          <div className="absolute -inset-3 bg-gradient-to-r from-teal-400/20 via-emerald-400/20 to-teal-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          
          {/* Hiệu ứng pulse nhẹ */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400/10 to-emerald-400/10 animate-pulse"></div>
        </div>

        <span className="hidden md:inline ml-2 font-medium tracking-wide">Chat</span>
      </button>

      {!isGuest && !isConnected && (
        <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full animate-pulse border border-white"></span>
      )}

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-md animate-bounce">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>

    {/* Chat Window - Màu xanh hiện đại */}
    {isChatOpen && (
      <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-5 md:w-96 md:h-[600px] w-full h-full bg-gradient-to-b from-teal-50/50 to-emerald-50/30 backdrop-blur-sm md:backdrop-blur-none md:bg-white md:rounded-2xl md:shadow-2xl flex flex-col overflow-hidden z-[9999] animate-in slide-in-from-bottom-full md:slide-in-from-bottom-5 duration-300 overscroll-contain border md:border-emerald-100"
        style={{
          WebkitOverflowScrolling: 'touch',
          maxHeight: '-webkit-fill-available',
        }}
      >
        {/* Header với gradient xanh hiện đại */}
       <div className="flex justify-between items-center bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 text-white px-4 py-3 safe-area-top-padding">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
                  <Image
                    src="/image/telesale.jpg"
                    alt="Phương Ly"
                    width={48}
                    height={48}
                    priority
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="absolute -inset-2 bg-white/10 rounded-full blur-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-white truncate">Phương Ly</h3>
              </div>
            </div>
          
          <button 
            onClick={() => setIsChatOpen(false)} 
            className="flex-shrink-0 text-white hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-colors active:bg-white/30 touch-manipulation hover:rotate-90 transition-transform"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Đóng chat"
          >
            ×
          </button>
        </div>

        {/* Messages container với nền xanh nhẹ */}
        <div 
          ref={chatContainerRef}
          className="flex-1 p-3 md:p-4 overflow-y-auto bg-gradient-to-b from-white via-teal-50/30 to-emerald-50/20 space-y-4 overscroll-contain"
          style={{
            WebkitOverflowScrolling: 'touch',
            overflowAnchor: 'none',
          }}
        >
          {/* Top Sentinel cho infinite scroll */}
          <div ref={topSentinelRef} className="h-2" />

          {/* Loading Spinner */}
          {renderLoadingSpinner()}

          {/* Empty state với design hiện đại */}
          {messages.length === 0 && !isTyping.admin && !isTyping.ai && (
            <div className="text-center py-4 md:py-8 px-4">
              <p className="text-lg font-semibold text-teal-900 mb-2">
                {currentUser ? 'Xin chào!' : 'Chào bạn! 👋'}
              </p>
              <p className="text-sm text-teal-700/80 max-w-xs mx-auto mb-4">
                {currentUser 
                  ? 'Chúng tôi sẵn sàng hỗ trợ bạn' 
                  : 'Tôi là trợ lý, hãy bắt đầu trò chuyện!'
                }
              </p>
              {currentUser && !conversationId && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-emerald-700">Nhập tin nhắn đầu tiên</span>
                </div>
              )}
            </div>
          )}

          {/* Messages list + AI Typing Bubble tích hợp */}
          {messages.map((msg, index) => {
            const isNewMessage = index >= messages.length - 3;
            const messageDelay = Math.min((messages.length - 1 - index) * 0.1, 0.3);
            const isUser = ['USER', 'GUEST'].includes(msg.senderType);

            // Đặc biệt: Nếu đây là tin nhắn placeholder của AI (message là '...' và đang typing)
            const isAiTypingPlaceholder = msg.senderType === 'BOT' && msg.message === '...' && isTyping.ai;

            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${
                  isNewMessage ? 'animate-in fade-in slide-in-from-bottom-2' : ''
                }`}
                style={{
                  animationDuration: isNewMessage ? '0.4s' : '0.2s',
                  animationDelay: isNewMessage ? `${messageDelay}s` : '0s',
                  animationFillMode: 'both'
                }}
              >
                <div className={`
                  relative max-w-[85%] md:max-w-[75%] break-words rounded-2xl px-4 py-3
                  ${isUser
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-br-none'
                    : 'bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 text-teal-900 rounded-bl-none'
                  }
                  ${isNewMessage ? 'transform transition-transform duration-300 active:scale-[0.98]' : ''}
                  shadow-sm hover:shadow-md transition-shadow
                `}>
                  {/* Decorative corner */}
                  {isUser ? (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-500 rounded-tl-full"></div>
                  ) : (
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-teal-50 border-l border-b border-teal-100 rounded-tr-full"></div>
                  )}

                  <div className="whitespace-pre-wrap break-words text-sm md:text-base leading-relaxed relative z-10">
                    {/* Nếu là placeholder typing → hiển thị dots nhảy */}
                    {isAiTypingPlaceholder ? (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    ) : (
                      renderMessageWithLinks(msg.message)
                    )}
                  </div>

                  {/* Thời gian + trạng thái gửi */}
                  <div className={`text-xs mt-2 flex items-center gap-2 ${isUser ? 'text-teal-100/80' : 'text-teal-600/70'}`}>
                    <span>{formatTime(msg.createdAt)}</span>
                    {msg.status === 'sending' && !isAiTypingPlaceholder && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-current rounded-full opacity-60 animate-pulse"></span>
                        <span className="text-xs">Đang gửi...</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicators với design đẹp */}
          {isTyping.admin && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl px-4 py-3 max-w-[85%] md:max-w-[75%]">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm font-medium text-teal-700">Đang soạn tin nhắn...</span>
                </div>
              </div>
            </div>
          )}

        

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area với design hiện đại */}
        <div className="p-3 md:p-4 border-t border-emerald-100 bg-gradient-to-r from-white to-teal-50/30 safe-area-padding-bottom">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={status.placeholder}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status.inputDisabled}
                className="w-full border border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 rounded-full px-4 py-3 md:py-3 text-base md:text-sm outline-none transition-all bg-white/80 backdrop-blur-sm text-teal-900 placeholder-teal-400 disabled:bg-teal-50 disabled:cursor-not-allowed shadow-inner"
                style={{
                  WebkitAppearance: 'none',
                  fontSize: '16px',
                }}
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-emerald-500/0 blur-sm opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
            
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || status.inputDisabled}
              className="relative bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-5 md:px-6 py-3 md:py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center min-w-[52px] min-h-[52px] group disabled:from-teal-300 disabled:to-emerald-300 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="relative z-10">
                <span className="md:hidden">📤</span>
                <span className="hidden md:inline">Gửi</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute -inset-2 bg-teal-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
          
          {/* Status message */}
          {isAiProcessing && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-emerald-600">Đang xử lý câu hỏi...</span>
            </div>
          )}
          
          {/* Scroll to bottom button */}
          {showScrollToBottom && (
            <button
              onClick={() => {
                scrollToBottom('smooth');
                setShowScrollToBottom(false);
              }}
              className="fixed md:absolute bottom-24 right-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-10 animate-bounce min-w-[44px] min-h-[44px] flex items-center justify-center hover:scale-110"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              title="Cuộn xuống tin nhắn mới nhất"
              aria-label="Cuộn xuống cuối"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}
        </div>
      </div>
    )}

    <style jsx global>{`
      /* Safe area handling cho iPhone */
      .safe-area-top-padding {
        padding-top: calc(0.75rem + env(safe-area-inset-top, 0px));
        padding-left: calc(1rem + env(safe-area-inset-left, 0px));
        padding-right: calc(1rem + env(safe-area-inset-right, 0px));
      }
      
      .safe-area-padding-bottom {
        padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
        padding-left: calc(1rem + env(safe-area-inset-left, 0px));
        padding-right: calc(1rem + env(safe-area-inset-right, 0px));
      }
      
      /* Product links với màu xanh */
      .product-link {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        color: #0d9488;
        text-decoration: none;
        font-weight: 500;
        padding: 0.125rem 0.375rem;
        border-radius: 0.375rem;
        background: rgba(13, 148, 136, 0.1);
        transition: all 0.2s ease;
      }
      
      .product-link:hover {
        color: #0f766e;
        background: rgba(13, 148, 136, 0.15);
        transform: translateY(-1px);
      }
      
      /* Optimize animations cho mobile */
      @media (prefers-reduced-motion: reduce) {
        .animate-in,
        .animate-bounce,
        .animate-pulse,
        .animate-spin {
          animation: none !important;
        }
      }
      
      /* Fix cho input font size trên iOS */
      input, textarea {
        font-size: 16px !important;
      }
      
      /* Improve tap targets cho mobile */
      @media (max-width: 768px) {
        button, 
        a, 
        [role="button"] {
          min-height: 44px;
          min-width: 44px;
        }
      }
      
      /* Custom animations */
      @keyframes float {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }
      
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
      
      /* Smooth transitions */
      * {
        transition: background-color 0.2s ease, border-color 0.2s ease;
      }
      
      /* Scrollbar styling */
      ::-webkit-scrollbar {
        width: 6px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(204, 251, 241, 0.3);
        border-radius: 3px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: rgba(20, 184, 166, 0.5);
        border-radius: 3px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(20, 184, 166, 0.7);
      }
    `}</style>
  </ChatContext.Provider>
);
  
}