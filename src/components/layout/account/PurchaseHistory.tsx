import React, { useState } from 'react';
import { Modal, List, Button, Typography, Descriptions, Table, Image } from 'antd';
import { useCurrent } from '@/hooks/auth/useCurrent';
import { useOrdersByUser } from '@/hooks/order/useOrdersByUser';
import { formatDate } from '@/utils/helpers';
import { Order } from '@/types/order.type';
import { getImageUrl } from '@/utils/getImageUrl';
import Link from 'next/link';
import { useChat } from '@/context/ChatContext'; // Import useChat để sử dụng context chat

const { Title } = Typography;

const PurchaseHistory: React.FC = () => {
  const { data: currentUser } = useCurrent();
  const userId = currentUser?.id;
  const { data: ordersData, isLoading, isError, error } = useOrdersByUser({ userId });
  const { sendMessage, isConnected, conversationId, joinConversation } = useChat(); // Lấy các giá trị từ ChatContext
  const [isChatOpen, setIsChatOpen] = useState(false); // State để kiểm soát chatbox (nếu không có setIsOpen trong context)

  const orders = ordersData?.data ?? [];

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Đang soạn đơn';
      case 'PAID': return 'Đã thanh toán';
      case 'PENDING': return 'Đang chờ xử lý';
      case 'SHIPPED': return 'Đang giao hàng';
      case 'DELIVERED': return 'Đã giao hàng';
      default: return 'Chưa xác định';
    }
  };

  const formatShippingInfo = (shippingInfo?: any) => {
    if (!shippingInfo) return 'Chưa có thông tin giao hàng';
    
    return (
      <>
        {shippingInfo.name}<br />
        {shippingInfo.phone}<br />
        {`${shippingInfo.address || ''}, ${shippingInfo.ward_name || ''}, ${shippingInfo.district_name || ''}, ${shippingInfo.province_name || ''}`.replace(/, , /g, ', ').replace(/^, |, $/g, '')}
      </>
    );
  };

  // Hàm xử lý khi bấm nút "Chat hỗ trợ"
  const handleChatSupport = (order: Order) => {
    if (!isConnected) {
      console.log('Chat chưa được kết nối');
      return;
    }

    // Mở chatbox (giả sử ChatBox dùng isOpen để hiển thị)
    setIsChatOpen(true);

    // Nếu chưa có conversationId, tham gia một conversation mới
    if (!conversationId) {
      joinConversation(order.id); // Sử dụng order.id để tạo conversation, hoặc tùy chỉnh theo logic backend
    }

    // Tạo tin nhắn với ID đơn hàng và tên sản phẩm
    const productNames = order.items
      ?.map((item) => item.productVariant?.product?.name)
      .filter((name) => name)
      .join(', ');
    const message = `Hỗ trợ đơn hàng ID: ${order.id}. Sản phẩm: ${productNames || 'Không có sản phẩm'}.`;

    // Gửi tin nhắn với metadata
    setTimeout(() => {
      sendMessage(message, { orderId: order.id });
    }, 500); // Delay nhẹ để đảm bảo conversation được khởi tạo
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (isError) {
    return <div>Lỗi khi tải đơn hàng: {error?.message}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-md shadow-md">
      <Title level={3} className="mb-4">Lịch sử mua hàng</Title>
      
      {orders.length > 0 ? (
        <List
          itemLayout="vertical"
          dataSource={orders}
          renderItem={(order) => (
            <List.Item
              key={order.id}
              actions={[
                <Button type="link" onClick={() => showOrderDetails(order)}>
                  Xem chi tiết
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">ID Đơn hàng: {order.id}</span>
                    <Button
                      type="link"
                      onClick={() => handleChatSupport(order)}
                      disabled={!isConnected}
                    >
                      Chat hỗ trợ
                    </Button>
                  </div>
                }
                description={`Ngày đặt hàng ${formatDate(order.createdAt)} - ${getStatusText(order.status)} - ${order.totalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} `}
              />
              {order.items?.slice(0, 3).map((item) => {
                const imageUrl = getImageUrl(
                  item.productVariant?.thumb || 
                  item.productVariant?.product?.thumb || 
                  null
                );
                
                return (
                  <div key={item.id} className="flex items-center mt-2">
                    <div className="w-12 h-12 rounded-md overflow-hidden shadow-sm flex-shrink-0">
                      <Image
                        src={imageUrl || '/images/no-image.png'}
                        alt={item.productVariant?.product?.name || 'Sản phẩm'}
                        preview={false}
                        className="w-full h-full object-cover"
                        fallback="/images/no-image.png"
                      />
                    </div>
                    <div className="ml-2 flex-1 flex items-center justify-between">
                      <div className="text-sm truncate max-w-[200px]">
                        {item.productVariant?.product?.name}
                      </div>
                      <Link href={`/san-pham/${item.productVariant?.product?.slug}`}>
                        <Button
                          type="primary"
                          size="small"
                          disabled={order.status !== 'DELIVERED'}
                        >
                          Đánh giá
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </List.Item>
          )}
        />
      ) : (
        <p>Chưa có đơn hàng nào.</p>
      )}

      <Modal
        open={isModalOpen}
        title="Chi tiết đơn hàng"
        onCancel={handleCloseModal}
        footer={[
          <Button key="back" onClick={handleCloseModal}>
            Đóng
          </Button>,
        ]}
        width={1000}
      >
        {selectedOrder && (
          <div className="border rounded-md p-4 mt-4">
            <Title level={5} className="mb-2">ID Đơn hàng: #{selectedOrder.id}</Title>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Trạng thái">
                {getStatusText(selectedOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {selectedOrder.paymentMethod?.name || 'Chưa xác định'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt hàng">
                {formatDate(selectedOrder.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={3}>
                {formatShippingInfo(selectedOrder.shippingInfo)}
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
                {(selectedOrder.shippingFee || 0)?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {selectedOrder.shippingInfo?.note || 'Không có ghi chú'}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng số tiền">
                {selectedOrder.totalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 16 }}>Sản phẩm trong đơn hàng</Title>
            <Table
              dataSource={selectedOrder.items ?? []}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: 'Hình ảnh',
                  dataIndex: 'productVariant',
                  key: 'image',
                  width: 80,
                  render: (variant: any) => {
                    const imageUrl = getImageUrl(
                      variant?.thumb || 
                      variant?.product?.thumb || 
                      null
                    );
                    
                    return (
                      <Image 
                        src={imageUrl || '/images/no-image.png'} 
                        alt="Product" 
                        width={50} 
                        height={50}
                        preview={false}
                        fallback="/images/no-image.png"
                      />
                    );
                  },
                },
                {
                  title: 'Sản phẩm',
                  render: (item: any) => (
                    <span className="block">
                      <div className="font-medium">{item.productVariant?.product?.name}</div>
                      <div className="text-sm text-gray-500">SKU: {item.productVariant.sku}</div>
                    </span>
                  ),
                  key: 'product',
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 80,
                  align: 'center' as const,
                },
                {
                  title: 'Giá',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  width: 120,
                  align: 'right' as const,
                  render: (price: number) => 
                    price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
                },
                {
                  title: 'Thành tiền',
                  key: 'total',
                  width: 140,
                  align: 'right' as const,
                  render: (item: any) => 
                    (item.quantity * (item.unitPrice || 0))?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseHistory;