import { useCallback, useState } from 'react';
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

  // ✅ Hàm kiểm tra token AI
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

  // ✅ Hàm cập nhật token
  const updateAiTokens = useCallback(async (tokensUsed: number) => {
    if (!adminShop || !tokensUsed || tokensUsed <= 0) return;

    try {
      await updateTokensMutation.mutateAsync({
        tokensUsed,
        tenantId
      });
      console.log(`✅ Tokens updated successfully. Used: ${tokensUsed}`);
    } catch (error) {
      console.error('❌ Failed to update tokens:', error);
      throw new Error('Không thể cập nhật token AI');
    }
  }, [adminShop, tenantId, updateTokensMutation]);

  // ✅ Gọi AI API - SIMPLIFIED VERSION
  const callAiApi = async (msg: string) => {
    const token = process.env.NEXT_PUBLIC_AI_PUBLIC_TOKEN;
    if (!token) throw new Error('No AI token');

    // Backend của bạn cần endpoint /v1/chat
    const AI_ENDPOINT = `${AI_URL}/chat`;

    console.log('🤖 Calling AI endpoint:', AI_ENDPOINT);
    console.log('📝 User message:', msg);

    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        prompt: msg,
        // Thêm metadata nếu backend cần
        metadata: {
          system: textPromptAi || 'Bạn là trợ lý bán hàng thông minh. Trả lời ngắn gọn, hữu ích.',
          max_tokens: 200,
          temperature: 0.2
        }
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ AI API error:', {
        status: res.status,
        statusText: res.statusText,
        error: errorText
      });
      throw new Error(`AI failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('🤖 AI Response data:', data);

    // Backend của bạn trả về response.text
    const aiResponse = data.response?.text || data.text || 'Xin lỗi, tôi không thể trả lời ngay lúc này.';

    // Xử lý token usage
    const isCachedResponse = data.cached === true;
    const actualTokensUsed = data.usage?.total_tokens || 0;
    
    if (!isCachedResponse && actualTokensUsed > 0) {
      await updateAiTokens(actualTokensUsed);
    }

    return aiResponse;
  };

  // ✅ Xử lý tin nhắn AI
  const sendAiMessage = useCallback(async (msg: string, targetConversationId?: number | null) => {
    if (isAiProcessing) {
      console.log('⏳ AI is already processing, skipping...');
      return;
    }

    // ✅ KIỂM TRA ADMIN SHOP ĐÃ LOAD CHƯA
    if (isLoadingAdminShop) {
      console.log('⏳ Waiting for admin shop data...');
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

    // ✅ KIỂM TRA TOKEN
    const tokenCheck = checkAiTokensAvailable();
    if (!tokenCheck.available) {
      console.error('❌ Not enough tokens to process AI message');
      
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
      console.log('⏳ Waiting for conversation ID...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentConvId = conversationId;
      if (!currentConvId) {
        console.error('❌ No conversation ID available');
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

    // Đợi một chút cho hiệu ứng typing
    await new Promise(resolve => setTimeout(resolve, isGuestMode ? 500 : 300));

    try {
      console.log('🤖 Processing AI message:', msg);

      // ✅ Gọi AI API - ĐƠN GIẢN, KHÔNG truyền sản phẩm
      const aiText = await callAiApi(msg);
      console.log('🤖 AI Response text:', aiText);

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
      console.error('❌ AI message error:', err);

      let errorMessage = 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.';
      
      if (err.message.includes('token') || err.message.includes('Token')) {
        errorMessage = err.message;
      } else if (err.message.includes('failed') || err.message.includes('AI failed')) {
        errorMessage = 'Kết nối AI tạm thời gián đoạn. Vui lòng thử lại sau.';
      } else if (err.message.includes('401')) {
        errorMessage = 'Token AI không hợp lệ. Vui lòng liên hệ quản trị viên.';
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
    setIsTyping
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