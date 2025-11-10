import { Modal, Input, Button, Avatar, Spin, Empty } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import ioClient from 'socket.io-client';
import { User } from '@/types/user.type';
import { useAuth } from '@/context/AuthContext';

interface ChatMessage {
  id: string | number;
  conversationId?: number;
  sessionId?: string;
  senderId?: number | null;
  senderType: 'USER' | 'GUEST' | 'BOT' | 'ADMIN';
  message: string;
  metadata?: any;
  createdAt: string;
}

interface UserChatModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null; 
  conversationId: number | null;
}

export function UserChatModal({ open, onClose, user, conversationId }: UserChatModalProps) {
  const [message, setMessage] = useState('');
  const [conversationMessages, setConversationMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
    const { currentUser, isLoading: isAuthLoading } = useAuth();
    const adminId = currentUser?.id;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isReloading, setIsReloading] = useState(false);

  // Scroll to bottom khi có tin nhắn mới
  const scrollToBottom = () => {
  // Kiểm tra nếu ref tồn tại
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }
};


useEffect(() => {
  const lastMsg = conversationMessages[conversationMessages.length - 1];
  if (lastMsg?.senderType === 'ADMIN' || ('' + lastMsg?.id).startsWith('temp-')) {
    scrollToBottom();
  }
}, [conversationMessages]);

  // Connect socket khi mở modal
  useEffect(() => {
    if (open) {
      const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
      const socketInstance = ioClient(`${WS_URL}/chat`, {
        auth: {
          userId: adminId,
          isAdmin: true,
          tenantId: parseInt(process.env.NEXT_PUBLIC_TENANT_ID || '1', 10),
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketInstance.on('connect', () => {
        setIsConnected(true);
        socketInstance.emit('admin-login', { adminId });
        if (conversationId) {
          socketInstance.emit('join:conversation', conversationId);
        }
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

     socketInstance.on('message', (msg: ChatMessage & { tempId?: string }) => {
        if (msg.conversationId !== conversationId) return;

        setConversationMessages((prev) => {
          // ✅ Nếu có tempId, thay thế tin tạm bằng tin thật
          if (msg.tempId) {
            return prev.map((m) =>
              m.id === msg.tempId ? { ...msg, id: msg.id, tempId: undefined } : m
            );
          }

          // ✅ Nếu tin này đã tồn tại (id trùng), bỏ qua
          const exists = prev.some((m) => m.id.toString() === msg.id.toString());
          if (exists) return prev;

          // ✅ Thêm mới nếu chưa có
          return [...prev, msg];
        });
      });

      socketInstance.on('new-user-message', (data: any) => {
        if (data.userId === user?.id) {
          loadConversation();
        }
      });

      socketInstance.on('reconnect', (attempt: any) => {
        if (conversationId) {
          socketInstance.emit('join:conversation', conversationId);
        }
        loadConversation();
      });

      socketInstance.on('connect_error', (error: any) => {
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [open, conversationId, adminId, user?.id]);

  // Load conversation khi mở modal hoặc user thay đổi
  useEffect(() => {
    if (open && user?.id && conversationId) {
      loadConversation();
    } else if (!user?.id || !conversationId) {
      setConversationMessages([]);
    }
  }, [open, user?.id, conversationId]);

  // Load conversation và messages từ API
  const loadConversation = useCallback(async () => {
    if (!user?.id || !conversationId || isReloading) return;
    setIsReloading(true);
    try {
      setLoading(true);
      const userId = parseInt(user.id.toString(), 10);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const params = { conversationId };

      const response = await axios.get(`${API_URL}/chat/messages`, {
        params,
        headers: { 'x-tenant-id': process.env.NEXT_PUBLIC_TENANT_ID || '1' },
      });

      let loadedMessages: ChatMessage[] = [];
      if (response.data.messages && Array.isArray(response.data.messages)) {
        loadedMessages = response.data.messages;
      }

      if (loadedMessages.length > 0) {
        const formattedMessages: ChatMessage[] = loadedMessages.map((msg: any) => ({
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          senderType: msg.senderType,
          message: msg.message,
          createdAt: msg.createdAt,
          metadata: msg.metadata,
        }));

        const sortedMessages = formattedMessages.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setConversationMessages(sortedMessages);
      }
    } catch (error) {
      setTimeout(() => loadConversation(), 2000);
    } finally {
      setLoading(false);
      setIsReloading(false);
    }
  },[user?.id, conversationId, isReloading])

  const handleSend = () => {
    if (!message.trim() || !isConnected || !socket || !conversationId) return;

     const tempId = `temp-${Date.now()}`;

    const tempMessage: ChatMessage = {
      id: tempId,
      conversationId,
      senderId: adminId,
      senderType: 'ADMIN',
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    setConversationMessages((prev) => [...prev, tempMessage]);
    setMessage('');

    socket.emit('admin:send-message', {
      conversationId,
      message: message.trim(),
      tempId
      
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      className="top-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
  {isConnected ? (
    <div className="flex items-center gap-2">
      <div>
        <span className="text-lg font-semibold">{user?.name}</span>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <span
            className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
          ></span>
          <span className={`${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? 'Đang kết nối' : 'Mất kết nối'}
          </span>
        </p>
      </div>
    </div>
  ) : (
    <div className="flex items-center text-green-500">
      <Spin size="small" />
      <span className="ml-2">Đang kết nối...</span>
    </div>
  )}
</div>


      {/* Conversation Messages */}
      <div className="flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <Spin tip="Đang tải tin nhắn..." />
          ) : conversationMessages.length === 0 ? (
            <Empty description="Chưa có tin nhắn nào" />
          ) : (
            <div>
              {conversationMessages.map((msg) => {
                const isAdmin = msg.senderType === 'ADMIN';
                const isBot = msg.senderType === 'BOT';
                const isUser = msg.senderType === 'USER' || msg.senderType === 'GUEST';

                return (
                  <div
                    key={msg.id}
                    className={`flex mb-3 ${
                      isAdmin ? 'justify-end' : 'justify-start'
                    } gap-2 items-end`}
                  >
                    {/* Avatar cho User/Bot */}
                    {isUser && (
                      <Avatar size={32} icon={<UserOutlined />} className="bg-gray-400" />
                    )}
                    {isBot && (
                      <Avatar size={32} className="bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                        BOT
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isAdmin
                          ? 'bg-blue-500 text-white'
                          : isBot
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <div className="text-xs mb-1 font-medium">
                        {isAdmin
                          ? 'Admin (Bạn)'
                          : isBot
                          ? 'Bot'
                          : 'Khách hàng'}
                      </div>
                      <div>{msg.message}</div>
                      <div
                        className={`text-xs mt-1 ${
                          isAdmin || isBot ? 'text-gray-200' : 'text-gray-400'
                        }`}
                        style={{ fontWeight: 'bold' }}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    {/* Avatar cho Admin */}
                    {isAdmin && (
                      <Avatar size={32} className="bg-blue-600 text-white">
                        A
                      </Avatar>
                    )}
                  </div>
                );
              })}
                <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <div className="border-t bg-white p-4">
            <div className="flex items-center gap-2">
                {/* TextArea */}
                <Input.TextArea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                disabled={!isConnected || !conversationId}
                className="flex-1"
                />

                {/* Button */}
                <Button
                type="primary"
                onClick={handleSend}
                disabled={!message.trim() || !isConnected || !conversationId}
                size="large"
                className="ml-2"
                >
                Gửi
                </Button>
            </div>

            {/* Hiển thị thông báo nếu mất kết nối */}
            {!isConnected && (
                <div className="text-xs text-red-500 mt-2 text-center font-semibold">
                ⚠️ Mất kết nối. Đang thử kết nối lại...
                </div>
            )}
            </div>
      </div>
    </Modal>
  );
}
