import { useCallback, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Product } from '@/types/product.type';
import { ChatMessage } from '@/components/layout/ChatBox';
import { useTenantAdminShop } from '../user/useTenantAdminShop';
import { useUpdateTenantAdminShopTokens } from '../user/useUpdateTenantAdminShopTokens';

interface UseAiMessageProps {
  conversationId: number | null;
  sessionId: string | null;
  currentUser: any;
  addMessage: (message: ChatMessage) => void;
  saveBotMessage: any;
  textPromptAi: string;
  findProductsByKeyword: (keyword: string) => Product[];
  isGuest: boolean;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsTyping: React.Dispatch<React.SetStateAction<{ admin: boolean; ai: boolean }>>;
}

export const useAiMessage = ({
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
}: UseAiMessageProps) => {
  const AI_URL = process.env.NEXT_PUBLIC_AI_URL!;
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const tenantId = Number(process.env.NEXT_PUBLIC_TENANT_ID || 1);

  // ✅ Lấy thông tin admin shop
  const { data: adminShop, isLoading: isLoadingAdminShop } = useTenantAdminShop(tenantId);

  // ✅ Hook update tokens
  const updateTokensMutation = useUpdateTenantAdminShopTokens();

  /**
   * 🔗 Trích xuất slug từ URL
   */
  const getProductSlugFromUrl = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    
    const pathname = window.location.pathname;
    const match = pathname.match(/san-pham\/([a-z0-9\-]+)/i);
    
    if (match && match[1]) {
      console.log('🔗 Slug từ URL:', match[1]);
      return match[1];
    }
    
    return null;
  }, []);

  /**
   * 🔍 Tìm sản phẩm theo slug
   */
  const getProductBySlug = useCallback((slug: string): Product | null => {
    if (!slug) return null;
    
    const slugKeyword = slug.split('-').pop() || slug;
    const products = findProductsByKeyword(slugKeyword);
    
    if (products.length > 0) {
      console.log('🔗 Product từ slug:', products[0]);
      return products[0];
    }
    
    return null;
  }, [findProductsByKeyword]);

  /**
   * 🆕 Tạo conversation history đơn giản
   */
  const buildConversationHistory = useCallback((messages: ChatMessage[]): string => {
    // Lấy tối đa 5 tin nhắn gần nhất (đơn giản hóa)
    const recentMessages = messages.slice(-5);
    
    if (recentMessages.length === 0) {
      return '';
    }

    // Format đơn giản
    return recentMessages
      .map(msg => {
        const role = msg.senderType === 'BOT' || msg.senderType === 'AI' ? 'Bot' : 'Khách';
        return `${role}: ${msg.message}`;
      })
      .join('\n');
  }, []);

  // ========================================
  // ✅ TOKEN MANAGEMENT
  // ========================================

  /**
   * Kiểm tra token AI
   */
  const checkAiTokensAvailable = useCallback(() => {
    if (!adminShop) {
      return { available: false, tokens: 0, message: 'Đang tải thông tin token...' };
    }

    const availableTokens = adminShop.tokenAI || 0;
    
    if (availableTokens <= 0) {
      return { 
        available: false, 
        tokens: availableTokens, 
        message: 'Chat Bot đã hết token AI. Vui lòng đợi quản trị viên nạp thêm.' 
      };
    }

    return { 
      available: true, 
      tokens: availableTokens, 
      message: `Còn ${availableTokens} token AI` 
    };
  }, [adminShop]);

  /**
   * Cập nhật token
   */
  const updateAiTokens = useCallback(async (tokensUsed: number) => {
    if (!adminShop || !tokensUsed || tokensUsed <= 0) return;

    try {
      await updateTokensMutation.mutateAsync({
        tokensUsed,
        tenantId
      });
    } catch (error) {
      console.error('❌ Lỗi cập nhật token:', error);
      throw new Error('Không thể cập nhật token AI');
    }
  }, [adminShop, tenantId, updateTokensMutation]);

  // ========================================
  // 🤖 AI API CALL - ĐƠN GIẢN HÓA
  // ========================================

  /**
   * Gọi API AI với metadata đơn giản
   */
  const callAiApi = useCallback(async (msg: string, currentMessages?: ChatMessage[]) => {
    const token = process.env.NEXT_PUBLIC_AI_PUBLIC_TOKEN;
    if (!token) throw new Error('Không có token AI');

    const AI_ENDPOINT = `${AI_URL}/chat`;
    
    // Lấy slug từ URL (nếu có)
    const productSlug = getProductSlugFromUrl();
    
    // Tạo metadata đơn giản - backend sẽ tự phân tích
    const metadata: any = {
      timestamp: new Date().toISOString()
    };

    // Thêm slug nếu có
    if (productSlug && productSlug !== 'none') {
      metadata.slug = productSlug;
    }

    // Thêm conversation history nếu có
    if (currentMessages && currentMessages.length > 0) {
      const conversationHistory = buildConversationHistory(currentMessages);
      if (conversationHistory) {
        metadata.conversationHistory = conversationHistory;
      }
    }

    // Thêm ownerEmail từ admin shop
    if (adminShop?.ownerEmail) {
      metadata.ownerEmail = adminShop.ownerEmail;
    }

    console.log('📤 Gửi đến backend:', {
      prompt: msg,
      metadata: metadata
    });

    // Gửi request đơn giản
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        prompt: msg,
        metadata: metadata
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Lỗi AI API:', res.status, errorText);
      throw new Error(`Lỗi AI: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    console.log('📥 Nhận từ backend:', {
      cached: data.cached,
      source: data.response?.source,
      hasProducts: data.response?.metadata?.hasProducts,
      tokensUsed: data.usage?.total_tokens
    });

    const aiResponse = data.response?.text || data.text || 'Xin lỗi, tôi không thể trả lời ngay lúc này.';

    // Xử lý token usage
    const isCachedResponse = data.cached === true;
    const actualTokensUsed = data.usage?.total_tokens || 0;
    
    if (!isCachedResponse && actualTokensUsed > 0) {
      await updateAiTokens(actualTokensUsed);
    }

    return aiResponse;
  }, [getProductSlugFromUrl, adminShop, updateAiTokens, buildConversationHistory]);

  // ========================================
  // 💬 MAIN SEND MESSAGE FUNCTION - ĐƠN GIẢN
  // ========================================

  /**
   * Xử lý gửi tin nhắn AI (frontend chỉ gửi, backend xử lý)
   */
  const sendAiMessage = useCallback(async (msg: string, targetConversationId?: number | null, currentMessages?: ChatMessage[]) => {
    if (isAiProcessing) {
      return;
    }

    // Kiểm tra admin shop
    if (isLoadingAdminShop) {
      const waitingMessage: ChatMessage = {
        id: `waiting-${Date.now()}`,
        senderType: 'BOT',
        message: 'Đang khởi tạo hệ thống...',
        conversationId: isGuest ? null : conversationId || undefined,
        sessionId,
        createdAt: new Date().toISOString(),
        status: isGuest ? 'local' : 'sent'
      };
      addMessage(waitingMessage);
      return;
    }

    // Kiểm tra token
    const tokenCheck = checkAiTokensAvailable();
    if (!tokenCheck.available) {
      console.error('❌ Không đủ token AI');
      
      const errorMessage: ChatMessage = {
        id: `token-error-${Date.now()}`,
        senderType: 'BOT',
        message: tokenCheck.message,
        conversationId: isGuest ? null : conversationId || undefined,
        sessionId,
        createdAt: new Date().toISOString(),
        status: isGuest ? 'local' : 'sent'
      };
      
      addMessage(errorMessage);
      return;
    }

    let currentConvId = targetConversationId !== undefined ? targetConversationId : conversationId;
    
    if (!currentConvId && !isGuest) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentConvId = conversationId;
      if (!currentConvId) {
        console.error('❌ Không có conversation ID');
        return;
      }
    }
    
    const isGuestMode = isGuest;
    const tempId = isGuestMode ? `ai-local-${Date.now()}` : `ai-temp-${Date.now()}`;

    setIsAiProcessing(true);
    setIsTyping(prev => ({ ...prev, ai: true }));

    // Thêm tin nhắn pending
    const aiPendingMessage: ChatMessage = {
      id: tempId,
      senderType: 'BOT',
      message: '...',
      conversationId: isGuestMode ? null : currentConvId || undefined,
      sessionId,
      createdAt: new Date().toISOString(),
      tempId,
      status: isGuestMode ? 'local' : 'sending'
    };
    
    addMessage(aiPendingMessage);

    // Đợi typing effect
    await new Promise(resolve => setTimeout(resolve, isGuestMode ? 500 : 300));

    try {
      // 🔥 CHỈ CẦN GỬI PROMPT, BACKEND TỰ PHÂN TÍCH
      const aiText = await callAiApi(msg, currentMessages);

      // Cập nhật tin nhắn
      setMessages(prev => 
        prev.map(msg => 
          msg.tempId === tempId 
            ? {
                ...msg,
                id: isGuestMode ? `ai-local-${Date.now()}` : `ai-${Date.now()}`,
                message: aiText,
                tempId: undefined,
                status: isGuestMode ? 'local' : 'sent'
              }
            : msg
        )
      );

      // Lưu vào database nếu cần
      if (!isGuestMode && currentConvId && aiText && aiText !== '...') {
        saveBotMessage.mutate({ 
          conversationId: Number(currentConvId),
          message: aiText,
          sessionId: sessionId || null
        });
      }

    } catch (err: any) {
      console.error('❌ Lỗi tin nhắn AI:', err);

      let errorMessage = 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.';
      
      if (err.message.includes('token') || err.message.includes('Token')) {
        errorMessage = err.message;
      } else if (err.message.includes('401')) {
        errorMessage = 'Token AI không hợp lệ. Vui lòng liên hệ quản trị viên.';
      } else if (err.message.includes('hết token')) {
        errorMessage = 'Chat Bot đã hết token AI. Vui lòng liên hệ quản trị viên.';
      } else if (err.message.includes('timeout') || err.message.includes('mạng')) {
        errorMessage = 'Kết nối mạng có vấn đề. Vui lòng thử lại.';
      }

      setMessages(prev => 
        prev.map(msg => 
          msg.tempId === tempId 
            ? {
                ...msg,
                message: errorMessage,
                tempId: undefined,
                status: isGuestMode ? 'local' : 'sent'
              }
            : msg
        )
      );
    } finally {
      setIsAiProcessing(false);
      setIsTyping(prev => ({ ...prev, ai: false }));
    }
  }, [
    isAiProcessing,
    isLoadingAdminShop,
    checkAiTokensAvailable,
    conversationId,
    isGuest,
    sessionId,
    addMessage,
    setMessages,
    saveBotMessage,
    setIsTyping,
    callAiApi
  ]);

  return {
    sendAiMessage,
    isAiProcessing,
    adminShop,
    isLoadingAdminShop,
    tokenInfo: adminShop ? { 
      availableTokens: adminShop.tokenAI,
      adminName: adminShop.name 
    } : null
  };
};