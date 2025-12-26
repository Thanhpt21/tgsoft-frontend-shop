import { useCallback, useState } from 'react';
import { Product } from '@/types/product.type';
import { ChatMessage } from '@/components/layout/ChatBox';

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
  const AIBAN_API_URL = 'https://api.aiban.vn/api/v1';
  const BOT_ID = 5;
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  /**
   * 🤖 Gọi API AI của aiban.vn để lấy phản hồi ngay lập tức
   */
  const callAibanApi = useCallback(async (userMessage: string) => {
    const token = process.env.NEXT_PUBLIC_AI_PUBLIC_TOKEN;
    
    if (!token) {
      throw new Error('Token API không được cấu hình');
    }

    // Lấy sessionId từ localStorage (dành cho guest) hoặc từ prop
    const actualSessionId = typeof window !== 'undefined' 
      ? localStorage.getItem('guestSessionId') || sessionId 
      : sessionId;

    const requestBody = {
      bot_id: BOT_ID,
      message: userMessage,
      session_id: actualSessionId, // Có thể null nếu chưa có session
    };


    try {
      const response = await fetch(`${AIBAN_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi API ${response.status}: ${errorText}`);
      }

      const data = await response.json();


      if (!data.response) {
        return 'Xin lỗi, tôi không thể trả lời ngay lúc này. Vui lòng thử lại sau.';
      }

      return data.response;
    } catch (error: any) {
      console.error('❌ AI API Error:', error);
      throw error;
    }
  }, [sessionId]);

  /**
   * 💬 Gửi tin nhắn AI (chỉ xử lý phản hồi cho tin nhắn hiện tại)
   */
  const sendAiMessage = useCallback(
    async (
      msg: string,
      targetConversationId?: number | null,
      currentMessages?: ChatMessage[]
    ) => {
      if (isAiProcessing) {
        return;
      }

      let currentConvId = targetConversationId ?? conversationId;

      // Nếu là user đã login nhưng chưa có conversationId → đợi một chút backend tạo
      if (!currentConvId && !isGuest) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        currentConvId = conversationId;
        if (!currentConvId) {
          console.warn('Không có conversationId để lưu bot message');
          // Vẫn tiếp tục trả lời AI dù chưa có convId
        }
      }

      const isGuestMode = isGuest;
      const tempId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Bắt đầu typing + thêm placeholder "..."
      setIsAiProcessing(true);
      setIsTyping(prev => ({ ...prev, ai: true }));

      const aiPendingMessage: ChatMessage = {
        id: tempId,
        senderType: 'BOT',
        message: '...',
        conversationId: isGuestMode ? null : currentConvId || undefined,
        sessionId,
        createdAt: new Date().toISOString(),
        tempId,
        status: isGuestMode ? 'local' : 'sending',
      };

      addMessage(aiPendingMessage);

      // Delay nhỏ để UI mượt
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const aiResponse = await callAibanApi(msg);

        // Cập nhật tin nhắn AI với nội dung thật
        setMessages(prev =>
          prev.map(message =>
            message.tempId === tempId
              ? {
                  ...message,
                  id: isGuestMode ? `ai-local-${Date.now()}` : `ai-${Date.now()}`,
                  message: aiResponse,
                  tempId: undefined,
                  status: isGuestMode ? 'local' : 'sent',
                }
              : message
          )
        );

        // Nếu là user đăng nhập → lưu tin nhắn bot vào DB
        if (!isGuestMode && currentConvId && aiResponse) {
          saveBotMessage.mutate({
            conversationId: Number(currentConvId),
            message: aiResponse,
            sessionId: sessionId || null,
          });
        }
      } catch (err: any) {
        let errorMessage = 'Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.';

        if (err.message.includes('401')) {
          errorMessage = 'Lỗi xác thực API. Vui lòng thử lại sau.';
        } else if (err.message.includes('network') || err.message.includes('timeout')) {
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra lại kết nối.';
        }

        setMessages(prev =>
          prev.map(message =>
            message.tempId === tempId
              ? {
                  ...message,
                  message: errorMessage,
                  tempId: undefined,
                  status: isGuestMode ? 'local' : 'failed',
                }
              : message
          )
        );
      } finally {
        setIsAiProcessing(false);
        setIsTyping(prev => ({ ...prev, ai: false }));
      }
    },
    [
      isAiProcessing,
      conversationId,
      isGuest,
      sessionId,
      addMessage,
      setMessages,
      saveBotMessage,
      setIsTyping,
      callAibanApi,
    ]
  );

  return {
    sendAiMessage,
    isAiProcessing,
  };
};