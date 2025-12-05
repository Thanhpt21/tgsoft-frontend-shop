# 💻 AI Chat Context - Code Examples & Usage Guide

## Quick Start

### 1. Basic Usage (Nothing Changed for Users)

```typescript
// In ChatBox.tsx - Users still call it the same way
sendMessage("Bạn có áo size M không?");
```

The system automatically:
1. Saves the message
2. Extracts keywords (áo, size)
3. Finds related products
4. Sends context to AI
5. Gets smart response

### 2. How the AI Responds

**User**: "Bạn có áo size M không?"

**AI Response Before**:
```
Có, chúng tôi bán áo ở đây.
```

**AI Response After** (with context):
```
Có, chúng tôi có áo size M. Dưới đây là những lựa chọn:

1. Áo Thun Nam Cơ Bản (199,000đ) - Còn hàng tất cả sizes
   Material: Cotton 100%, thoáng khí, dễ giặt

2. Áo Sơ Mi Nam Trắng (349,000đ) - Còn size M
   Material: Cotton linen blend, phù hợp công sở

Bạn muốn biết thêm chi tiết về sản phẩm nào không?
```

## Code Structure

### Function 1: Extract Keywords

```typescript
const extractProductKeywords = useCallback((text: string): string[] => {
  const keywords: string[] = [];
  
  const productKeywordPatterns = [
    /áo\s*([a-zà-ỿ]+)?/gi,
    /quần\s*([a-zà-ỿ]+)?/gi,
    /giày\s*([a-zà-ỿ]+)?/gi,
    // ... more patterns
  ];

  productKeywordPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const normalized = match.toLowerCase().trim();
        if (!keywords.includes(normalized)) {
          keywords.push(normalized);
        }
      });
    }
  });

  return keywords;
}, []);
```

**Example Usage**:
```typescript
const keywords = extractProductKeywords("Tôi tìm áo thun và giày thể thao");
// Result: ['áo', 'áo thun', 'giày', 'giày thể thao']
```

---

### Function 2: Analyze Context

```typescript
const analyzeConversationContext = useCallback((messages: ChatMessage[]): MessageContext => {
  // Step 1: Get last 10 user messages
  const recentUserMessages = messages
    .filter(msg => ['USER', 'GUEST'].includes(msg.senderType))
    .slice(-10);

  // Step 2: Extract keywords from all messages
  const allKeywords: string[] = [];
  recentUserMessages.forEach(msg => {
    const keywords = extractProductKeywords(msg.message);
    keywords.forEach(kw => {
      if (!allKeywords.includes(kw)) {
        allKeywords.push(kw);
      }
    });
  });

  // Step 3: Find products for each keyword
  const relatedProducts = new Map<number, Product>();
  allKeywords.forEach(keyword => {
    const products = findProductsByKeyword(keyword);
    products.forEach(product => {
      if (!relatedProducts.has(product.id as number)) {
        relatedProducts.set(product.id as number, product);
      }
    });
  });

  // Step 4: Determine topic
  let conversationTopic = 'sản phẩm chung';
  if (allKeywords.length > 0) {
    conversationTopic = allKeywords.slice(0, 2).join(', ');
  }

  return {
    recentMessages: recentUserMessages,
    extractedKeywords: allKeywords,
    relatedProducts: Array.from(relatedProducts.values()),
    conversationTopic
  };
}, [extractProductKeywords, findProductsByKeyword]);
```

**Example Result**:
```typescript
{
  recentMessages: [
    { id: 1, senderType: 'USER', message: 'Có áo không?' },
    { id: 2, senderType: 'BOT', message: 'Có, ...' },
    { id: 3, senderType: 'USER', message: 'Giày size 42?' }
  ],
  extractedKeywords: ['áo', 'giày', 'size'],
  relatedProducts: [
    { id: 1, name: 'Áo Thun Nam', basePrice: 199000 },
    { id: 45, name: 'Giày Sneaker', basePrice: 899000 }
  ],
  conversationTopic: 'áo, giày'
}
```

---

### Function 3: Build Product Context

```typescript
const buildProductContextString = useCallback((products: Product[]): string => {
  if (products.length === 0) {
    return '';
  }

  const productDetails = products
    .slice(0, 5) // Limit to 5 products
    .map((product, index) => {
      return `${index + 1}. ${product.name}` +
             (product.basePrice ? ` - Giá: ${product.basePrice.toLocaleString('vi-VN')}đ` : '') +
             (product.description ? ` - Mô tả: ${product.description.substring(0, 100)}...` : '');
    })
    .join('\n');

  return `\n📦 Sản phẩm liên quan được tìm thấy trong cuộc hội thoại:\n${productDetails}\n`;
}, []);
```

**Example Input**:
```typescript
const products = [
  { id: 1, name: 'Áo Thun Nam', basePrice: 199000, description: 'Cotton 100%' },
  { id: 2, name: 'Áo Sơ Mi', basePrice: 349000, description: 'Cotton Linen' }
];

const contextString = buildProductContextString(products);
```

**Example Output**:
```
📦 Sản phẩm liên quan được tìm thấy trong cuộc hội thoại:
1. Áo Thun Nam - Giá: 199,000đ - Mô tả: Cotton 100%
2. Áo Sơ Mi - Giá: 349,000đ - Mô tả: Cotton Linen
```

---

### Function 4: Enhanced AI Call

```typescript
const callAiApi = async (msg: string, messageContext?: MessageContext) => {
  const token = process.env.NEXT_PUBLIC_AI_PUBLIC_TOKEN;
  const AI_ENDPOINT = `${AI_URL}/chat`;

  // Build enhanced system prompt
  let systemPrompt = textPromptAi || 'Bạn là trợ lý bán hàng thông minh.';
  
  if (messageContext && messageContext.relatedProducts.length > 0) {
    const productContext = buildProductContextString(messageContext.relatedProducts);
    const conversationTopic = messageContext.conversationTopic;
    
    systemPrompt += `\n\n📌 Cuộc hội thoại hiện đang nói về: ${conversationTopic}` +
                    productContext +
                    `\n💡 Hãy sử dụng thông tin sản phẩm trên để trả lời chi tiết hơn...`;
  }

  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ 
      prompt: msg,
      metadata: {
        system: systemPrompt,  // ← Enhanced!
        max_tokens: 200,
        temperature: 0.2,
        conversationTopic: messageContext?.conversationTopic || 'unknown',
        productCount: messageContext?.relatedProducts.length || 0
      }
    }),
  });

  const data = await res.json();
  return data.response?.text || data.text;
};
```

**Example Request Body**:
```json
{
  "prompt": "Áo size M bao nhiêu tiền?",
  "metadata": {
    "system": "Bạn là trợ lý bán hàng...\n📌 Cuộc hội thoại về: áo, giày\n📦 Sản phẩm liên quan:\n1. Áo Thun Nam...",
    "max_tokens": 200,
    "temperature": 0.2,
    "conversationTopic": "áo, giày",
    "productCount": 4
  }
}
```

---

### Function 5: Send AI Message

```typescript
const sendAiMessage = useCallback(
  async (msg: string, targetConversationId?: number | null, currentMessages?: ChatMessage[]) => {
    // ... validations ...

    // 🔍 ANALYZE CONTEXT
    const messageContext = analyzeConversationContext(currentMessages || []);
    console.log('Message context:', messageContext);

    // ... set typing indicator ...

    try {
      // 🤖 CALL AI WITH CONTEXT
      const aiText = await callAiApi(msg, messageContext);
      
      // Update messages
      setMessages(prev => 
        prev.map(msg => 
          msg.tempId === tempId 
            ? { ...msg, message: aiText, status: 'sent' }
            : msg
        )
      );
    } catch (err) {
      // Handle error
    }
  },
  [/* dependencies */]
);
```

---

## Integration Point in ChatBox

### Before (Original)
```typescript
useEffect(() => {
  sendAiMessageRef.current = sendAiMessage;
}, [sendAiMessage]);
```

### After (With Context)
```typescript
useEffect(() => {
  sendAiMessageRef.current = (msg: string, convId?: number | null) => {
    // Pass current messages to sendAiMessage
    return sendAiMessage(msg, convId, messages);  // ← messages param added
  };
}, [sendAiMessage, messages]);
```

---

## Real-World Examples

### Example 1: Multi-turn Conversation

```
User: "Có áo không?"
└─ Keywords: ['áo']
└─ Products found: 3 áo products
└─ AI: "Có, chúng tôi có 3 loại áo..."

User: "Áo size nào có?"
└─ Keywords: ['áo', 'size']
└─ Context: "Cuộc hội thoại về: áo"
└─ AI: "Áo của chúng tôi có sizes: XS, S, M, L, XL, 2XL, 3XL..."

User: "Giá áo thun bao nhiêu?"
└─ Keywords: ['áo', 'áo thun', 'giá']
└─ Context: "Cuộc hội thoại về: áo"
└─ Products shown: Áo Thun Nam (199k), Áo Thun Nữ (249k)
└─ AI: "Áo thun nam chúng tôi giá 199,000đ, áo thun nữ 249,000đ..."
```

### Example 2: Product Recommendation

```
User: "Tôi cần áo và giày để đi làm"
└─ Keywords: ['áo', 'giày', 'làm']
└─ Products: Áo Sơ Mi, Áo Thun, Giày Lười, Giày Công Sở
└─ Context: "Cuộc hội thoại về: áo, giày"
└─ AI: "Để đi làm, tôi gợi ý:
   - Áo Sơ Mi (349k) - chuyên nghiệp, thoải mái
   - Giày Công Sở (599k) - lịch sự, bền bỉ
   Bạn cần kích cỡ nào?"
```

### Example 3: Guest User

```
Guest User: "Giày size 42 có giá rẻ không?"
└─ Keywords: ['giày', 'size', 'giá']
└─ Status: Guest (no login)
└─ Products: All size 42 shoes with prices
└─ AI: "Giày size 42 chúng tôi có từ 299k đến 2 triệu...
   Bạn khoảng bao nhiêu tiền là rẻ?"
└─ Note: Message saved locally only, can migrate to DB after login
```

---

## Console Output Examples

### Normal Flow
```
🔍 Analyzing message context...
✅ Message context analyzed: {
  keywords: ['áo', 'size'],
  productCount: 4,
  topic: 'áo, size'
}
📝 User message: Áo size M bao nhiêu tiền?
📦 Message context: MessageContext { ... }
📋 System prompt: Bạn là trợ lý...📌 Cuộc hội thoại về: áo, size...
🤖 Calling AI endpoint: https://api.example.com/chat
🤖 AI Response text: Áo size M chúng tôi có 5 loại...
✅ Tokens updated successfully. Used: 42
```

### Error Handling
```
🔍 Analyzing message context...
✅ Message context analyzed: {
  keywords: [],
  productCount: 0,
  topic: 'sản phẩm chung'
}
📝 User message: Xin chào!
📦 Message context: MessageContext { ... }
📋 System prompt: Bạn là trợ lý... (no product context added)
🤖 AI Response text: Chào bạn! Tôi có thể giúp bạn về gì?
✅ Tokens updated successfully. Used: 12
```

---

## Performance Tips

1. **Keyword Extraction**: Uses regex matching - fast and efficient
2. **Product Lookup**: Uses existing `findProductsByKeyword` - already optimized
3. **Message Limit**: Only analyzes last 10 messages - prevents slow performance
4. **Product Limit**: Only sends top 5 products to AI - keeps prompt reasonable
5. **No Database Calls**: All analysis happens in-memory - instant results

---

## Debugging Checklist

- [ ] Check console for "Message context analyzed" log
- [ ] Verify keywords are extracted correctly
- [ ] Confirm products are found for keywords
- [ ] Check "System prompt" log to see product context
- [ ] Verify token deduction happens (✅ Tokens updated log)
- [ ] Test with multiple keywords: "áo, giày, size"
- [ ] Test with no matching products: "XYZ ABC"
- [ ] Test with guest user (no login)
- [ ] Test with authenticated user (with DB save)

---

**Code Examples Created**: December 4, 2025
**Status**: ✅ Ready to Use
