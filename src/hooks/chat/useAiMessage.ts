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
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  /**
   * 📜 Lấy lịch sử chat từ API aiban.vn
   */
  const fetchChatHistory = useCallback(async () => {
    try {
      const response = await fetch(`${AIBAN_API_URL}/chat/history?bot_id=${BOT_ID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi lấy lịch sử: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        setChatHistory(data.data);
        return data.data;
      }

      return [];
    } catch (error) {
      return [];
    }
  }, []);

  /**
   * 🔄 Chuyển đổi lịch sử từ API sang ChatMessage format
   */
  const convertHistoryToChatMessages = useCallback((history: any[]): ChatMessage[] => {
    const messages: ChatMessage[] = [];

    history.forEach((item) => {
      if (item.user_message) {
        messages.push({
          id: `user-${item.id}`,
          senderType: 'GUEST',
          message: item.user_message,
          conversationId: conversationId || undefined,
          sessionId: item.session_id,
          createdAt: item.created_at,
          status: 'sent'
        });
      }

      if (item.ai_response) {
        messages.push({
          id: `ai-${item.id}`,
          senderType: 'BOT',
          message: item.ai_response,
          conversationId: conversationId || undefined,
          sessionId: item.session_id,
          createdAt: item.created_at,
          status: 'sent'
        });
      }
    });

    return messages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [conversationId]);

  /**
   * 🤖 Gọi API AI của aiban.vn
   */
  const callAibanApi = useCallback(async (userMessage: string) => {
    const token = process.env.NEXT_PUBLIC_AI_PUBLIC_TOKEN;
    
    if (!token) {
      throw new Error('Token API không được cấu hình');
    }

    const requestBody = {
      bot_id: BOT_ID,
      message: userMessage
    };

    try {
      const response = await fetch(`${AIBAN_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi API ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.response) {
        return 'Xin lỗi, tôi không thể trả lời ngay lúc này.';
      }

      return data.response;

    } catch (error: any) {
      throw error;
    }
  }, []);

  /**
   * 💬 Gửi tin nhắn AI
   */
  const sendAiMessage = useCallback(async (
    msg: string, 
    targetConversationId?: number | null, 
    currentMessages?: ChatMessage[]
  ) => {
    if (isAiProcessing) {
      return;
    }

    let currentConvId = targetConversationId !== undefined ? targetConversationId : conversationId;
    
    if (!currentConvId && !isGuest) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentConvId = conversationId;
      if (!currentConvId) {
        return;
      }
    }
    
    const isGuestMode = isGuest;
    const tempId = isGuestMode ? `ai-local-${Date.now()}` : `ai-temp-${Date.now()}`;

    setIsAiProcessing(true);
    setIsTyping(prev => ({ ...prev, ai: true }));

    const aiPendingMessage: ChatMessage = {
      id: tempId,
      senderType: 'BOT',
      message: 'Đang suy nghĩ...',
      conversationId: isGuestMode ? null : currentConvId || undefined,
      sessionId,
      createdAt: new Date().toISOString(),
      tempId,
      status: isGuestMode ? 'local' : 'sending'
    };
    
    addMessage(aiPendingMessage);

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const aiResponse = await callAibanApi(msg);

      setMessages(prev => 
        prev.map(message => 
          message.tempId === tempId 
            ? {
                ...message,
                id: isGuestMode ? `ai-local-${Date.now()}` : `ai-${Date.now()}`,
                message: aiResponse,
                tempId: undefined,
                status: isGuestMode ? 'local' : 'sent'
              }
            : message
        )
      );

      if (!isGuestMode && currentConvId && aiResponse && aiResponse !== 'Đang suy nghĩ...') {
        saveBotMessage.mutate({ 
          conversationId: Number(currentConvId),
          message: aiResponse,
          sessionId: sessionId || null
        });
      }

      await fetchChatHistory();

    } catch (err: any) {
      let errorMessage = 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.';
      
      if (err.message.includes('401')) {
        errorMessage = 'Không có quyền truy cập API. Vui lòng kiểm tra cấu hình.';
      } else if (err.message.includes('timeout') || err.message.includes('network')) {
        errorMessage = 'Kết nối mạng có vấn đề. Vui lòng thử lại.';
      }

      setMessages(prev => 
        prev.map(message => 
          message.tempId === tempId 
            ? {
                ...message,
                message: errorMessage,
                tempId: undefined,
                status: isGuestMode ? 'local' as const : 'failed' as const
              }
            : message
        )
      );
    } finally {
      setIsAiProcessing(false);
      setIsTyping(prev => ({ ...prev, ai: false }));
    }
  }, [
    isAiProcessing,
    conversationId,
    isGuest,
    sessionId,
    addMessage,
    setMessages,
    saveBotMessage,
    setIsTyping,
    callAibanApi,
    fetchChatHistory
  ]);

  /**
   * 🔄 Load lịch sử chat vào messages
   */
  const loadHistoryIntoMessages = useCallback(async () => {
    const history = await fetchChatHistory();
    if (history.length > 0) {
      const messages = convertHistoryToChatMessages(history);
      setMessages(messages);
      return messages;
    }
    return [];
  }, [fetchChatHistory, convertHistoryToChatMessages, setMessages]);

  return {
    sendAiMessage,
    isAiProcessing,
    chatHistory,
    fetchChatHistory,
    loadHistoryIntoMessages,
    convertHistoryToChatMessages
  };
};