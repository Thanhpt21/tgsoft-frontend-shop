import { useCallback } from 'react';

import { Product } from '@/types/product.type';
import { ChatMessage } from '@/components/layout/ChatBox';
import { useCheckTenantAdminShopTokens } from '@/hooks/user/useCheckTenantAdminShopTokens';
import { useUpdateTenantAdminShopTokens } from '@/hooks/user/useUpdateTenantAdminShopTokens';
import { useTenantAdminShopTokens } from '@/hooks/user/useTenantAdminShopTokens';

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
  tenantId?: number;
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
    tenantId = 1
}: UseAiMessageProps) => {
  const AI_URL = process.env.NEXT_PUBLIC_AI_URL!;
  const TOKENS_PER_AI_CALL = 10; // Chi phí token cho mỗi lần gọi AI (default fallback)

  // Hooks check & update token
  const checkTokens = useCheckTenantAdminShopTokens();
  const updateTokens = useUpdateTenantAdminShopTokens();
  const { data: adminShopTokens, isLoading: isTokensLoading } = useTenantAdminShopTokens(tenantId);

  // Kiểm tra loại tin nhắn
  const checkMessageType = (msg: string) => {
    const lowerMsg = msg.toLowerCase().trim();
    const greetingKeywords = ['xin chào', 'hello', 'hi', 'chào', 'helo', 'hi there'];
    const thankYouKeywords = ['cảm ơn', 'thanks', 'thank you', 'cám ơn', 'thank'];
    const goodbyeKeywords = ['tạm biệt', 'goodbye', 'bye', 'see you', 'bai'];
    
    return {
      isGreeting: greetingKeywords.some(keyword => lowerMsg.includes(keyword)),
      isThankYou: thankYouKeywords.some(keyword => lowerMsg.includes(keyword)),
      isGoodbye: goodbyeKeywords.some(keyword => lowerMsg.includes(keyword)),
      isSimpleQuestion: lowerMsg.includes('?') && lowerMsg.length < 30,
      lowerMsg
    };
  };

// Xử lý câu chào hỏi
const handleGreeting = (currentConvId: number | null, isGuestMode: boolean, tempId: string) => {
  const greetings = isGuestMode 
    ? [
        "Xin chào! 👋 Tôi là AI trợ lý của cửa hàng. Tôi có thể giúp gì cho bạn?",
        "Chào bạn! 😊 Rất vui được gặp bạn. Bạn cần tìm sản phẩm gì?",
        "Hello! Tôi ở đây để hỗ trợ bạn. Bạn đang tìm kiếm sản phẩm nào?",
        "Chào mừng bạn! 🎉 Tôi có thể giúp bạn tìm các sản phẩm phù hợp."
      ]
    : [
        `Xin chào ${currentUser?.name || 'bạn'}! 👋 Tôi là AI trợ lý của cửa hàng. Tôi có thể giúp gì cho bạn?`,
        `Chào ${currentUser?.name || 'bạn'}! 😊 Rất vui được gặp bạn. Bạn cần tìm sản phẩm gì?`,
        `Hello ${currentUser?.name || 'bạn'}! Tôi ở đây để hỗ trợ bạn. Bạn đang tìm kiếm sản phẩm nào?`,
        `Chào mừng ${currentUser?.name || 'bạn'} trở lại! 🎉 Tôi có thể giúp bạn tìm các sản phẩm phù hợp.`
      ];
  
  const finalAiText = greetings[Math.floor(Math.random() * greetings.length)];
  
  return {
    finalAiText,
    shouldSave: !isGuestMode && !!currentConvId, // FIX: Đảm bảo trả về boolean
    tempId
  };
};

// Xử lý câu cảm ơn
const handleThankYou = (currentConvId: number | null, isGuestMode: boolean, tempId: string) => {
  const thankYouResponses = [
    "Không có gì! 😊 Rất vui được giúp đỡ bạn. Nếu cần thêm gì, cứ hỏi nhé!",
    "Cảm ơn bạn! 💖 Nếu bạn có thắc mắc gì khác, tôi luôn sẵn sàng hỗ trợ.",
    "Rất hân hạnh! 👍 Chúc bạn một ngày tốt lành!",
    "Không có chi! ✨ Tôi rất vui khi được hỗ trợ bạn."
  ];
  
  const finalAiText = thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
  
  return {
    finalAiText,
    shouldSave: !isGuestMode && !!currentConvId, // FIX: Đảm bảo trả về boolean
    tempId
  };
};

// Xử lý câu tạm biệt
const handleGoodbye = (currentConvId: number | null, isGuestMode: boolean, tempId: string) => {
  const goodbyeResponses = [
    "Tạm biệt bạn! 👋 Hẹn gặp lại!",
    "Chúc bạn một ngày tốt lành! 🌟",
    "Tạm biệt! Cảm ơn bạn đã ghé thăm!",
    "Hẹn gặp lại bạn! 😊"
  ];
  
  const finalAiText = goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)];
  
  return {
    finalAiText,
    shouldSave: !isGuestMode && !!currentConvId, // FIX: Đảm bảo trả về boolean
    tempId
  };
};

// Xử lý câu hỏi đơn giản
const handleSimpleQuestion = (lowerMsg: string, currentConvId: number | null, isGuestMode: boolean, tempId: string) => {
  const simpleQuestions: { [key: string]: string } = {
    'giờ mở cửa': 'Cửa hàng mở cửa từ 8:00 đến 22:00 hàng ngày.',
    'địa chỉ': 'Cửa hàng chúng tôi tại 123 Đường ABC, Quận XYZ, TP.HCM.',
    'ship hàng': 'Chúng tôi ship hàng toàn quốc, phí ship từ 20.000đ.',
    'thanh toán': 'Chấp nhận thanh toán tiền mặt, chuyển khoản, ví điện tử.',
    'đổi trả': 'Chính sách đổi trả trong 7 ngày với sản phẩm còn nguyên tem.',
    'giá ship': 'Phí ship nội thành 20.000đ, ngoại thành 30.000đ, toàn quốc từ 35.000đ.',
    'khuyến mãi': 'Hiện đang có nhiều chương trình khuyến mãi. Bạn có thể xem chi tiết trên website!',
  };

  const matchedQuestion = Object.keys(simpleQuestions).find(question => 
    lowerMsg.includes(question)
  );

  if (matchedQuestion) {
    return {
      finalAiText: simpleQuestions[matchedQuestion],
      shouldSave: !isGuestMode && !!currentConvId, // FIX: Đảm bảo trả về boolean
      tempId
    };
  }

  return null;
};

  // Gọi AI API
  const callAiApi = async (msg: string, relevantProducts: Product[]) => {
    const token = adminShopTokens?.token;
    if (!token) throw new Error('No AI token');

    // 🔥 CHECK NẾU ADMIN SHOP CÓ 0 TOKEN
    if (adminShopTokens && adminShopTokens.token === 0) {
      const error = new Error(`❌ Admin shop không có token AI. Hiện tại: 0 token. Vui lòng nạp thêm token để sử dụng dịch vụ AI.`);
      (error as any).code = 'NO_TOKENS';
      throw error;
    }

    // 🔥 CHECK TOKEN TRƯỚC KHI GỌI AI (dùng default estimate)
    const checkResult = await checkTokens.mutateAsync({
      tokensNeeded: TOKENS_PER_AI_CALL,
      tenantId
    });

    if (!checkResult.hasEnoughTokens) {
      const error = new Error(`Không đủ token AI. Hiện tại: ${checkResult.currentTokens}, cần: ${checkResult.tokensNeeded}`);
      (error as any).code = 'INSUFFICIENT_TOKENS';
      throw error;
    }

    console.log(`✅ Token check passed. Current: ${checkResult.currentTokens}, Checking needed: ${TOKENS_PER_AI_CALL}`);

    const productList = relevantProducts.map((product: Product) => 
      `- ${product.name} (Giá: ${product.basePrice.toLocaleString('vi-VN')}đ) - Link: san-pham/${product.slug}${product.description ? ` - Mô tả: ${product.description}` : ''}${product.promotionProducts && product.promotionProducts.length > 0 ? ' - ĐANG KHUYẾN MÃI' : ''}`
    ).join('\n');

    let finalPrompt = '';
    if (textPromptAi) {
      if (relevantProducts.length > 0) {
        finalPrompt = `${textPromptAi}

DANH SÁCH SẢN PHẨM HIỆN CÓ TRONG CỬA HÀNG:
${productList}

QUY TẮC BẮT BUỘC TUYỆT ĐỐI:
1. CHỈ ĐƯỢC gợi ý sản phẩm CÓ TRONG DANH SÁCH TRÊN
2. TUYỆT ĐỐI KHÔNG được tạo ra, bịa đặt, hoặc gợi ý sản phẩm KHÔNG CÓ trong danh sách
3. Khi gợi ý sản phẩm, LUÔN đính kèm link theo định dạng: [Xem sản phẩm](san-pham/{slug})
4. Mỗi tin nhắn chỉ gợi ý tối đa 2 sản phẩm
5. Nếu không có sản phẩm phù hợp, hãy trả lời lịch sự và đề nghị họ thử từ khóa khác
6. Luôn đề cập đến giá cả và link sản phẩm khi giới thiệu
7. Nếu sản phẩm có khuyến mãi, hãy thông báo cho khách hàng
8. Luôn trả lời thân thiện, nhiệt tình

CÂU HỎI CỦA KHÁCH: "${msg}"

HÃY TƯ VẤN VÀ GỢI Ý SẢN PHẨM (CHỈ TRONG DANH SÁCH TRÊN):`;
      } else {
        finalPrompt = `${textPromptAi}

QUY TẮC BẮT BUỘC:
- Nếu không tìm thấy sản phẩm phù hợp, hãy trả lời lịch sự: "Hiện chưa có sản phẩm phù hợp với yêu cầu của bạn. Vui lòng thử từ khóa khác hoặc liên hệ nhân viên để được hỗ trợ thêm."
- Luôn giữ thái độ thân thiện, nhiệt tình

CÂU HỎI CỦA KHÁCH: "${msg}"

TRẢ LỜI:`;
      }
    } else {
      finalPrompt = `Bạn là nhân viên tư vấn bán hàng thân thiện và nhiệt tình. CHỈ được gợi ý sản phẩm có trong danh sách được cung cấp. TUYỆT ĐỐI KHÔNG được tạo ra sản phẩm mới.

${relevantProducts.length > 0 ? `DANH SÁCH SẢN PHẨM CÓ SẴN:\n${productList}\n\nHÃY TƯ VẤN:` : 'KHÔNG CÓ SẢN PHẨM PHÙ HỢP. HÃY THÔNG BÁO CHO KHÁCH:'}

Câu hỏi: "${msg}"`;
    }

    const res = await fetch(`${AI_URL}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        prompt: finalPrompt,  
        metadata: {
          isGuest: !currentUser,
          sessionId: sessionId,
          hasProductsContext: relevantProducts.length > 0,
          productCount: relevantProducts.length,
          productLinks: relevantProducts.map((p: Product) => `san-pham/${p.slug}`)
        } 
      }),
    });

    if (!res.ok) throw new Error('AI failed');
    const data = await res.json();
    const aiResponse = data.response?.text || 'Xin lỗi, tôi không thể trả lời ngay lúc này.';

    // 🔥 LẤY ACTUAL TOKENS TỪ API RESPONSE & TRỪ TOKEN SAU KHI GỌI AI THÀNH CÔNG
    const isCachedResponse = data.cached === true;
    const actualTokensUsed = data.usage?.total_tokens;
    
    // Metadata để tracking token usage
    const tokenMetadata = {
      isCached: isCachedResponse,
      tokensUsed: actualTokensUsed,
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
    };
    
    if (isCachedResponse) {
      console.log(`⚡ Response từ cache - không trừ token`);
      console.log(`📊 Token metadata:`, tokenMetadata);
    } else {
      console.log(`💳 API used ${actualTokensUsed} tokens (prompt: ${data.usage?.prompt_tokens}, completion: ${data.usage?.completion_tokens})`);
      console.log(`💳 Deducting ${actualTokensUsed} tokens from admin shop...`);
      console.log(`📊 Token metadata:`, tokenMetadata);
      
      await updateTokens.mutateAsync({
        tokensUsed: actualTokensUsed,
        tenantId
      });

      console.log(`✅ Tokens deducted successfully. Admin now has: ${checkResult.currentTokens - actualTokensUsed} tokens`);
    }

    // Lưu tokenMetadata để sử dụng khi lưu message
    return { aiResponse, tokenMetadata };
  };

  // Xử lý tin nhắn AI
  const sendAiMessage = useCallback(async (msg: string, targetConversationId?: number | null) => {
    let currentConvId = targetConversationId !== undefined ? targetConversationId : conversationId;
    
    // Nếu chưa có conversationId, đợi một chút
    if (!currentConvId && !isGuest) {
      console.log('⏳ Waiting for conversation creation...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentConvId = conversationId;
      
      if (!currentConvId) {
        console.log('❌ Cannot send AI message: Still no conversation ID');
        return;
      }
    }
    
    const { isGreeting, isThankYou, isGoodbye, isSimpleQuestion, lowerMsg } = checkMessageType(msg);
    const isGuestMode = isGuest;
    const tempId = isGuestMode ? `ai-local-${Date.now()}` : `ai-temp-${Date.now()}`;

        // Bật trạng thái typing
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
      // Xử lý các loại tin nhắn đặc biệt
      let response: { finalAiText: string; shouldSave: boolean; tempId: string } | null = null;

      if (isGreeting) {
        response = handleGreeting(currentConvId, isGuestMode, tempId);
      } else if (isThankYou) {
        response = handleThankYou(currentConvId, isGuestMode, tempId);
      } else if (isGoodbye) {
        response = handleGoodbye(currentConvId, isGuestMode, tempId);
      } else if (isSimpleQuestion) {
        response = handleSimpleQuestion(lowerMsg, currentConvId, isGuestMode, tempId);
      }

      // Nếu có response từ các handler đặc biệt
      if (response) {
        setMessages(prev => 
          prev.map(msg => 
            msg.tempId === response!.tempId 
              ? {
                  ...msg,
                  id: isGuestMode ? `ai-local-${Date.now()}` : `ai-${Date.now()}`,
                  message: response!.finalAiText,
                  tempId: undefined,
                  status: isGuestMode ? 'local' : 'sent'
                }
              : msg
          )
        );

        // Lưu vào database nếu cần
        if (response.shouldSave && currentConvId) {
          saveBotMessage.mutate({ 
            conversationId: Number(currentConvId),
            message: response.finalAiText, 
            sessionId: sessionId || null
          });
        }
        return;
      }

      // Xử lý bằng AI API cho các tin nhắn phức tạp
      const relevantProducts = findProductsByKeyword(msg);
      const aiCallResult = await callAiApi(msg, relevantProducts);
      let aiText = aiCallResult.aiResponse;
      const tokenMetadata = aiCallResult.tokenMetadata;

      // Xử lý kết quả từ AI
      let finalAiText = aiText;
      if (relevantProducts.length > 0) {
        const suggestedProducts = relevantProducts.map((p: Product) => p.name);
        const hasInvalidProduct = suggestedProducts.some((productName: any) => 
          !aiText.includes(productName)
        );
        
        if (hasInvalidProduct && !aiText.includes('chưa có sản phẩm')) {
          const safeRecommendations = relevantProducts.slice(0, 2).map((product: Product) => 
            `- **${product.name}** - Giá: ${product.basePrice.toLocaleString('vi-VN')}đ [Xem sản phẩm](san-pham/${product.slug})${product.description ? ` - ${product.description}` : ''}`
          ).join('\n');
          
          finalAiText = `Chào bạn! Dựa trên yêu cầu của bạn, mình gợi ý một số sản phẩm phù hợp:\n\n${safeRecommendations}\n\nBạn có thể click vào link để xem chi tiết sản phẩm nhé!`;
        }
      } else if (relevantProducts.length === 0 && !aiText.includes('chưa có sản phẩm')) {
        finalAiText = 'Hiện chưa có sản phẩm phù hợp với yêu cầu của bạn. Vui lòng thử từ khóa khác hoặc liên hệ nhân viên để được hỗ trợ thêm.';
      } 

      // Cập nhật tin nhắn
      setMessages(prev => 
        prev.map(msg => 
          msg.tempId === tempId 
            ? {
                ...msg,
                id: isGuestMode ? `ai-local-${Date.now()}` : `ai-${Date.now()}`,
                message: finalAiText,
                tempId: undefined,
                status: isGuestMode ? 'local' : 'sent'
              }
            : msg
        )
      );

      // Lưu vào database nếu cần - truyền tokenMetadata vào metadata
      if (!isGuestMode && currentConvId && finalAiText && finalAiText !== '...' && finalAiText !== 'Xin lỗi, tôi không thể trả lời ngay lúc này.') {
        saveBotMessage.mutate({ 
          conversationId: Number(currentConvId),
          message: finalAiText,
          metadata: tokenMetadata,
          sessionId: sessionId || null
        });
      }

    } catch (err: any) {
      console.error('❌ AI message error:', err);

      let errorMessage = 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.';
      let isTokenError = false;

      // Xử lý lỗi token
      if (err.code === 'NO_TOKENS' || err.message?.includes('không có token')) {
        errorMessage = `🤖 AI hiện không thể phản hồi. Vui lòng thông cảm và liên hệ cửa hàng để được hỗ trợ thêm.`;
        isTokenError = true;
      } else if (err.code === 'INSUFFICIENT_TOKENS' || err.message?.includes('Không đủ token')) {
        errorMessage = `🤖 AI hiện không thể phản hồi. Vui lòng thông cảm và liên hệ cửa hàng để được hỗ trợ thêm.`;
        isTokenError = true;
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

      // Lưu vào database nếu là token error
      if (!isGuestMode && currentConvId && isTokenError) {
        saveBotMessage.mutate({ 
          conversationId: Number(currentConvId),
          message: errorMessage,
          metadata: { 
            isTokenError: true,
            timestamp: new Date().toISOString()
          },
          sessionId: sessionId || null
        });
      }
    } finally {
      // Tắt trạng thái typing
      setIsTyping(prev => ({ ...prev, ai: false }));
    }
  }, [
    conversationId,
    sessionId,
    currentUser,
    addMessage,
    saveBotMessage,
    textPromptAi,
    findProductsByKeyword,
    isGuest,
    setIsTyping,
    checkTokens,
    updateTokens,
    tenantId,
    setMessages
  ]);

  return {
    sendAiMessage
  };
};