# 🤖 AI Chat Context & Product Recognition Feature

## Overview

Tính năng này cho phép AI có thể nhận diện và gợi ý sản phẩm dựa trên các tin nhắn gần đây của người dùng. AI sẽ tự động phân tích cuộc hội thoại để hiểu bối cảnh và trả lời các câu hỏi chi tiết hơn về sản phẩm.

## Kiến Trúc

### 1. **Message Analysis System** (`analyzeConversationContext`)
Phân tích toàn bộ cuộc hội thoại để trích xuất:
- **Keywords**: Các từ khóa liên quan đến sản phẩm (áo, quần, giày, phụ kiện, etc.)
- **Related Products**: Các sản phẩm phù hợp với keywords được tìm thấy
- **Conversation Topic**: Chủ đề chính của cuộc hội thoại

### 2. **Product Context Builder** (`buildProductContextString`)
Xây dựng một chuỗi thông tin sản phẩm gọn gàng để truyền cho AI:
```
📦 Sản phẩm liên quan được tìm thấy trong cuộc hội thoại:
1. Áo Thun Nam Cơ Bản - Giá: 199,000đ - Mô tả: Áo thun nam chất liệu cotton 100%...
2. Quần Jeans Nam Slim Fit - Giá: 549,000đ - Mô tả: Quần jeans nam với kiểu dáng slim fit...
```

### 3. **Enhanced AI API Call** (`callAiApi`)
Gửi request tới AI API kèm theo:
- **Original Message**: Câu hỏi của người dùng
- **Product Context**: Danh sách các sản phẩm liên quan
- **Enhanced System Prompt**: Hướng dẫn AI sử dụng context sản phẩm

## Cách Hoạt Động

### Flow Chi Tiết

```
1. User gửi tin nhắn
    ↓
2. ChatBox.sendMessage() được gọi
    ↓
3. Sau khi tin nhắn user được lưu, AI được trigger
    ↓
4. sendAiMessage() được gọi với:
    - msg: Nội dung tin nhắn
    - targetConversationId: ID cuộc hội thoại
    - currentMessages: Danh sách tất cả tin nhắn hiện tại (NEW!)
    ↓
5. analyzeConversationContext(currentMessages) được gọi:
    - Lấy 10 tin nhắn gần nhất từ user/guest
    - Trích xuất keywords từ các tin nhắn
    - Tìm sản phẩm liên quan từ mỗi keyword
    - Xác định topic chính của cuộc hội thoại
    ↓
6. callAiApi(msg, messageContext) được gọi:
    - Xây dựng system prompt mới với product context
    - Gửi request tới AI API kèm full context
    ↓
7. AI phản hồi dựa trên:
    - Tin nhắn ban đầu
    - Các sản phẩm liên quan
    - System prompt với hướng dẫn sử dụng product context
    ↓
8. Phản hồi được hiển thị và lưu vào database
```

## Keyword Detection

Các loại sản phẩm được nhận diện:

- **Quần áo**: áo, áo thun, sơ mi, áo nam, áo nữ, quần, jeans, tây, short
- **Giày**: giày, dép, sandal
- **Phụ kiện**: phụ kiện, túi, mũ, nón, ví, thắt lưng
- **Khác**: vớ, tất, găng tay, gang tay, bao tay

## Implementation Details

### Files Được Sửa Đổi

#### 1. `src/hooks/chat/useAiMessage.ts`

**New Functions:**
```typescript
// Trích xuất keywords từ tin nhắn
extractProductKeywords(text: string): string[]

// Phân tích context từ các tin nhắn gần đây
analyzeConversationContext(messages: ChatMessage[]): MessageContext

// Xây dựng chuỗi thông tin sản phẩm
buildProductContextString(products: Product[]): string
```

**Updated Functions:**
```typescript
// Giờ nhận 2 parameter
callAiApi(msg: string, messageContext?: MessageContext)

// Giờ nhận 3 parameter (thêm currentMessages)
sendAiMessage(msg: string, targetConversationId?: number | null, currentMessages?: ChatMessage[])
```

#### 2. `src/components/layout/ChatBox.tsx`

**Updated:**
```typescript
// Truyền current messages khi gọi sendAiMessage
useEffect(() => {
  sendAiMessageRef.current = (msg: string, convId?: number | null) => {
    return sendAiMessage(msg, convId, messages);  // ← Thêm messages parameter
  };
}, [sendAiMessage, messages]);
```

## System Prompt Enhancement Example

**Trước:**
```
Bạn là trợ lý bán hàng thông minh. Trả lời ngắn gọn, hữu ích.
```

**Sau:**
```
Bạn là trợ lý bán hàng thông minh. Trả lời ngắn gọn, hữu ích.

📌 Cuộc hội thoại hiện đang nói về: áo, giày

📦 Sản phẩm liên quan được tìm thấy trong cuộc hội thoại:
1. Áo Thun Nam Cơ Bản - Giá: 199,000đ - Mô tả: Áo thun nam chất liệu cotton...
2. Giày Sneaker Nam Trắng - Giá: 899,000đ - Mô tả: Giày sneaker nam kiểu dáng hiện đại...

💡 Hãy sử dụng thông tin sản phẩm trên để trả lời câu hỏi chi tiết hơn về: áo, giày
Tham khảo thông tin sản phẩm nếu có liên quan, nhưng đừng buộc thêm sản phẩm nếu không cần thiết.
```

## Console Logging

Khi AI được trigger, bạn sẽ thấy các logs:

```
🔍 Analyzing message context...
✅ Message context analyzed: {
  keywords: ['áo', 'giày'],
  productCount: 5,
  topic: 'áo, giày'
}
📝 User message: Giày có size 42 không?
📦 Message context: MessageContext { ... }
📋 System prompt: [Enhanced prompt with product info]
🤖 AI Response text: Có, chúng tôi có giày size 42 với các mẫu: ...
```

## Benefits

✅ **Better Context Understanding**: AI hiểu rõ hơn về sản phẩm đang được nói tới
✅ **Smarter Recommendations**: Có thể gợi ý sản phẩm liên quan dựa trên cuộc hội thoại
✅ **Detailed Answers**: Trả lời chi tiết hơn về sản phẩm cụ thể
✅ **Natural Conversation**: Cuộc hội thoại trở nên tự nhiên và hữu ích hơn
✅ **Better User Experience**: Người dùng cảm thấy AI hiểu nhu cầu của họ

## Testing Checklist

- [ ] User gửi câu hỏi về áo/quần/giày
- [ ] AI nhận diện keywords và tìm được sản phẩm liên quan
- [ ] Console logs hiển thị message context với keywords và products
- [ ] AI trả lời với thông tin chi tiết từ sản phẩm
- [ ] Test với multiple keywords (VD: "Áo và giày màu xanh")
- [ ] Test với guest users (không cần logged in)
- [ ] Test với authenticated users (có lưu vào database)
- [ ] Token deduction vẫn hoạt động bình thường

## Troubleshooting

### Issue: AI không nhận diện sản phẩm
**Solution**: Kiểm tra console để xem extracted keywords có chính xác không. Có thể cần thêm keywords trong `extractProductKeywords`.

### Issue: System prompt quá dài
**Solution**: Hiện tại giới hạn 5 sản phẩm. Nếu cần thay đổi, sửa line:
```typescript
.slice(0, 5) // Thay 5 bằng số cần thiết
```

### Issue: Messages không được truyền
**Solution**: Kiểm tra ChatBox.tsx có truyền `messages` vào `sendAiMessage` không.

## Future Enhancements

1. **Category-based Context**: Nhận diện category của sản phẩm để tìm kiếm chính xác hơn
2. **User Preference Learning**: Ghi nhớ sở thích của user để gợi ý tốt hơn
3. **Multi-language Support**: Hỗ trợ nhiều ngôn ngữ để detect keywords
4. **Image-based Context**: Nếu user gửi hình ảnh, nhận diện sản phẩm từ ảnh
5. **Rating & Review Context**: Tham khảo reviews để trả lời về chất lượng sản phẩm

---

**Last Updated**: December 4, 2025
**Status**: ✅ Production Ready
