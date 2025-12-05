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

interface MessageContext {
  recentMessages: ChatMessage[];
  extractedKeywords: string[];
  relatedProducts: Product[];
  conversationTopic: string;
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

  // ========================================
  // 🔑 CỤM TỪ KHÓA CHO PHÂN LOẠI CÂU HỎI
  // ========================================

  const QUESTION_KEYWORDS = {
    // 🎯 SẢN PHẨM
    PRODUCT: [
      'áo', 'quần', 'giày', 'dép', 'mũ', 'nón', 'túi', 'ví', 'váy', 'đầm',
      'thun', 'sơ mi', 'jeans', 'kaki', 'short', 'hoodie', 'jacket',
      'vớ', 'tất', 'phụ kiện', 'thắt lưng', 'khăn', 'găng tay'
    ],
    
    // 💰 GIÁ CẢ & MUA HÀNG
    PRICE: [
      'giá', 'bao nhiêu tiền', 'bao nhiêu', 'giá cả', 'cost', 'price',
      'rẻ', 'đắt', 'giá trị', 'chi phí', 'hết bao nhiêu'
    ],
    
    // 🛒 MUA HÀNG & THANH TOÁN
    PURCHASE: [
      'mua', 'đặt hàng', 'order', 'thanh toán', 'payment', 'checkout',
      'giỏ hàng', 'cart', 'mua ở đâu', 'mua đâu', 'ở đâu bán', 'có bán', 'bán không'
    ],
    
    // 📦 VẬN CHUYỂN
    SHIPPING: [
      'giao hàng', 'ship', 'vận chuyển', 'delivery', 'phí ship',
      'thời gian giao', 'bao lâu nhận', 'freeship', 'miễn phí ship'
    ],
    
    // 🔄 ĐỔI TRẢ & BẢO HÀNH
    RETURN: [
      'đổi', 'trả', 'hoàn', 'return', 'exchange', 'refund',
      'bảo hành', 'warranty', 'lỗi', 'hư', 'hỏng', 'sai size'
    ],
    
    // 📏 KÍCH THƯỚC & FIT
    SIZE: [
      'size', 'kích thước', 'form dáng', 'đo', 'mặc vừa',
      'nhỏ', 'lớn', 'vừa', 'fit', 'oversize', 'ôm'
    ],
    
    // 🎨 MÀU SẮC & CHẤT LIỆU
    STYLE: [
      'màu', 'màu sắc', 'màu gì', 'color', 'colour',
      'chất liệu', 'vải', 'làm bằng', 'material', 'fabric',
      'cotton', 'len', 'da', 'jeans', 'kaki'
    ],
    
    // ❓ TƯ VẤN & GỢI Ý
    ADVICE: [
      'tư vấn', 'giới thiệu', 'recommend', 'suggest', 'nên mua',
      'phù hợp', 'dành cho', 'ai mặc', 'mặc đi đâu', 'phong cách'
    ],
    
    // ⚙️ TÍNH NĂNG & CHẤT LƯỢNG
    FEATURE: [
      'tính năng', 'đặc điểm', 'ưu điểm', 'có gì', 'feature',
      'tốt không', 'có tốt không', 'chất lượng', 'độ bền'
    ],
    
    // 🧼 BẢO QUẢN & SỬ DỤNG
    CARE: [
      'bảo quản', 'giặt', 'sử dụng', 'care', 'wash',
      'ủi', 'là', 'phơi', 'tẩy', 'dry clean'
    ],
    
    // 👥 CHÍNH SÁCH & HỖ TRỢ
    POLICY: [
      'chính sách', 'policy', 'điều khoản', 'terms',
      'hỗ trợ', 'support', 'liên hệ', 'contact',
      'hotline', 'email', 'zalo', 'facebook'
    ],
    
    // 🎁 KHUYẾN MÃI & ƯU ĐÃI
    PROMOTION: [
      'khuyến mãi', 'sale', 'discount', 'giảm giá',
      'ưu đãi', 'promotion', 'deal', 'voucher', 'coupon'
    ],
    
    // 📝 ĐĂNG KÝ & TÀI KHOẢN
    ACCOUNT: [
      'đăng ký', 'register', 'tài khoản', 'account',
      'đăng nhập', 'login', 'đăng xuất', 'logout',
      'thông tin', 'profile', 'thay đổi mật khẩu'
    ],
    
    // 🔄 FOLLOW-UP ĐƠN GIẢN
    FOLLOW_UP: [
      'nó', 'cái này', 'sản phẩm này', 'cái đó',
      'được không', 'đc không', 'thế nào', 'ra sao'
    ]
  };

  // ========================================
  // 🔍 HELPER FUNCTIONS
  // ========================================

  /**
   * 📊 Xác định loại câu hỏi
   */
  const determineQuestionType = useCallback((message: string): string => {
    const normalized = message.toLowerCase().trim();
    
    // Kiểm tra từng nhóm keywords
    const questionTypes = Object.entries(QUESTION_KEYWORDS);
    
    for (const [type, keywords] of questionTypes) {
      if (keywords.some(keyword => normalized.includes(keyword))) {
        return type.toLowerCase();
      }
    }
    
    // Mặc định
    return normalized.length < 25 ? 'short_question' : 'general';
  }, []);

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
      return products[0];
    }
      console.log('🔗 Product từ slug:', products[0]);
    return null;
  }, [findProductsByKeyword]);

  /**
   * 📌 Phân tích ngữ cảnh hội thoại
   */
  const analyzeConversationContext = useCallback((messages: ChatMessage[]): MessageContext => {
    const recentMessages = messages.slice(-8);
    
    const keywords: string[] = [];
    const productMap = new Map<number, Product>();
    
    // Trích xuất keywords từ tin nhắn user
    recentMessages.forEach(msg => {
      if (msg.senderType === 'USER' || msg.senderType === 'GUEST') {
        const messageLower = msg.message.toLowerCase();
        
        // Tìm keywords trong message
        Object.values(QUESTION_KEYWORDS).flat().forEach(keyword => {
          if (messageLower.includes(keyword)) {
            if (!keywords.includes(keyword)) {
              keywords.push(keyword);
            }
          }
        });
        
        // Tìm sản phẩm liên quan
        const foundProducts = findProductsByKeyword(msg.message);
        foundProducts.forEach(product => {
          if (!productMap.has(product.id as number)) {
            productMap.set(product.id as number, product);
          }
        });
      }
    });
    
    // Xác định chủ đề
    let conversationTopic = 'sản phẩm chung';
    if (keywords.length > 0) {
      conversationTopic = keywords.slice(0, 3).join(', ');
    }
    
    return {
      recentMessages,
      extractedKeywords: keywords,
      relatedProducts: Array.from(productMap.values()),
      conversationTopic
    };
  }, [findProductsByKeyword]);

  /**
   * 🆕 Tạo conversation history CHI TIẾT để gửi lên backend
   */
  const buildConversationHistory = useCallback((messages: ChatMessage[]): string => {
    // Lấy tối đa 10 tin nhắn gần nhất
    const recentMessages = messages.slice(-10);
    
    if (recentMessages.length === 0) {
      return '';
    }

    // Format với timestamp để backend dễ phân tích
    return recentMessages
      .map((msg, index) => {
        const role = msg.senderType === 'BOT' || msg.senderType === 'AI' ? 'Bot' : 'Khách';
        const timestamp = new Date(msg.createdAt).toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        // Format: [Thời gian] Role: Message
        return `[${timestamp}] ${role}: ${msg.message}`;
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
  // 🤖 AI API CALL - CẢI TIẾN
  // ========================================

  /**
   * Gọi API AI với metadata tối ưu
   */
  const callAiApi = useCallback(async (msg: string, messageContext?: MessageContext, currentMessages?: ChatMessage[]) => {
    const token = process.env.NEXT_PUBLIC_AI_PUBLIC_TOKEN;
    if (!token) throw new Error('Không có token AI');

    const AI_ENDPOINT = `${AI_URL}/chat`;
    
    // Xác định loại câu hỏi
    const questionType = determineQuestionType(msg);
    
    // Lấy slug từ URL
    const productSlug = getProductSlugFromUrl();
    
    // 🆕 Tạo metadata đầy đủ hơn
    const metadata: any = {
      max_tokens: 150,
      temperature: 0.75, // 🆕 Tăng lên để AI linh hoạt hơn (giống backend)
      question_type: questionType,
      timestamp: new Date().toISOString()
    };

    // 🎯 THÊM SLUG NẾU CÓ
    if (productSlug && productSlug !== 'none') {
      metadata.slug = productSlug;
    }

    // 🆕 LUÔN GỬI LỊCH SỬ HỘI THOẠI (dù có slug hay không)
    if (currentMessages && currentMessages.length > 0) {
      const conversationHistory = buildConversationHistory(currentMessages);
      if (conversationHistory) {
        metadata.conversationHistory = conversationHistory;
      }
    }

    // 👤 THÊM ownerEmail
    if (adminShop?.ownerEmail) {
      metadata.ownerEmail = adminShop.ownerEmail;
    }

    // 🆕 THÊM CÁC KEYWORDS ĐÃ PHÂN TÍCH
    if (messageContext) {
      // Lấy các từ khóa từ câu hỏi
      const extractedKeywords: string[] = [];
      const lowerMsg = msg.toLowerCase();
      
      Object.entries(QUESTION_KEYWORDS).forEach(([category, keywords]) => {
        const matched = keywords.filter(kw => lowerMsg.includes(kw.toLowerCase()));
        if (matched.length > 0) {
          extractedKeywords.push(...matched);
        }
      });

      if (extractedKeywords.length > 0) {
        metadata.extracted_keywords = extractedKeywords.slice(0, 10); // Lấy tối đa 10 keywords
      }

      // Conversation topic
      if (messageContext.conversationTopic && messageContext.conversationTopic !== 'sản phẩm chung') {
        metadata.conversationTopic = messageContext.conversationTopic;
      }
    }

    // 🏷️ THÊM PRODUCT INFO NẾU CÓ SLUG
    if (productSlug) {
      const currentProduct = getProductBySlug(productSlug);
      if (currentProduct) {
        metadata.product_name = currentProduct.name;
        if (currentProduct.basePrice) {
          metadata.product_price = currentProduct.basePrice;
        }
      }
    }

    // Gửi request
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
    

    const aiResponse = data.response?.text || data.text || 'Xin lỗi, tôi không thể trả lời ngay lúc này.';

    // Xử lý token usage
    const isCachedResponse = data.cached === true;
    const actualTokensUsed = data.usage?.total_tokens || 0;
    
    if (!isCachedResponse && actualTokensUsed > 0) {
      await updateAiTokens(actualTokensUsed);
    }

    return aiResponse;
  }, [determineQuestionType, getProductSlugFromUrl, getProductBySlug, adminShop, updateAiTokens, buildConversationHistory, QUESTION_KEYWORDS]);

  // ========================================
  // 💬 MAIN SEND MESSAGE FUNCTION - CẢI TIẾN
  // ========================================

  /**
   * Xử lý gửi tin nhắn AI
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

    
    const messageContext = analyzeConversationContext(currentMessages || []);
    
    const questionType = determineQuestionType(msg);

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

      // Gọi API AI - TRUYỀN currentMessages VÀO
      const aiText = await callAiApi(msg, messageContext, currentMessages);

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
    analyzeConversationContext,
    determineQuestionType,
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
    } : null,
    questionKeywords: QUESTION_KEYWORDS
  };
};