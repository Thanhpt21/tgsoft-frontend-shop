'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';

const getSenderName = (senderType: string) => {
  switch (senderType) {
    case 'BOT': return '🤖 Bot';
    case 'ADMIN': return '👨‍💼 Admin';
    case 'USER': return 'Bạn';
    case 'GUEST': return 'Bạn';
    default: return 'Unknown';
  }
};

export default function ChatBox() {
  const { messages, sendMessage, isConnected, isTyping, loadMessages, conversationId } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống dưới cùng khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      const isAtBottom = messagesEndRef.current.getBoundingClientRect().top <= window.innerHeight;
      if (isAtBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // Load messages khi mở chatbox
  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen, loadMessages, conversationId]);

  // Xử lý khi người dùng gửi tin nhắn
  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input); // Gửi tin nhắn tới server
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Định dạng thời gian
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Kiểm tra nếu là tin nhắn của người dùng (USER hoặc GUEST)
  const isOwnMessage = (msg: typeof messages[0]) => {
    return msg.senderType === 'USER' || msg.senderType === 'GUEST';
  };

  return (
    <>
      {/* Nút chat nổi */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-[9999] bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 flex items-center gap-2"
      >
        💬 <span className="font-medium">Chat hỗ trợ</span>
        {!isConnected && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 w-80 max-h-[80vh] z-[9999] bg-white border border-gray-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
            <div>
              <h3 className="font-semibold text-md">Hỗ trợ trực tuyến</h3>
              <p className="text-xs text-blue-100 flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
                ></span>
                {isConnected ? 'Đang kết nối' : 'Mất kết nối'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-500 w-7 h-7 rounded-full flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-2">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-6">
                <div className="text-4xl mb-2">👋</div>
                <p className="text-sm">Xin chào! Chúng tôi có thể giúp gì cho bạn?</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${isOwnMessage(msg) ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] rounded-2xl px-3 py-2 ${
                    isOwnMessage(msg)
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {!isOwnMessage(msg) && (
                    <div className="text-xs text-gray-500 mb-1 font-medium">
                      {getSenderName(msg.senderType)}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  <div className={`text-xs mt-1 ${isOwnMessage(msg) ? 'text-blue-200' : 'text-gray-400'}`}>
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!isConnected}
                className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !isConnected}
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Gửi
              </button>
            </div>
            {!isConnected && (
              <p className="text-xs text-red-500 mt-2 text-center">⚠️ Đang kết nối lại...</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}