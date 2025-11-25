import React, { useState } from 'react';
import { Modal, Button, Image, Badge } from 'antd';
import {
  ShoppingOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  StarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useCurrent } from '@/hooks/auth/useCurrent';
import { useOrdersByUser } from '@/hooks/order/useOrdersByUser';
import { formatDate } from '@/utils/helpers';
import { Order } from '@/types/order.type';
import { getImageUrl } from '@/utils/getImageUrl';
import Link from 'next/link';


const PurchaseHistory: React.FC = () => {
  const { data: currentUser } = useCurrent();
  const userId = currentUser?.id;
  const { data: ordersData, isLoading, isError, error } = useOrdersByUser({ userId });
  const [chatClickedOrders, setChatClickedOrders] = useState<number[]>([]);
 

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { text: 'Đang soạn đơn', color: 'bg-gray-100 text-gray-700', icon: <FileTextOutlined /> };
      case 'PENDING':
        return { text: 'Đang chờ xử lý', color: 'bg-yellow-100 text-yellow-700', icon: <ClockCircleOutlined /> };
      case 'PAID':
        return { text: 'Đã thanh toán', color: 'bg-blue-100 text-blue-700', icon: <CheckCircleOutlined /> };
      case 'SHIPPED':
        return { text: 'Đang giao hàng', color: 'bg-purple-100 text-purple-700', icon: <TruckOutlined /> };
      case 'DELIVERED':
        return { text: 'Đã giao hàng', color: 'bg-green-100 text-green-700', icon: <CheckCircleOutlined /> };
      default:
        return { text: 'Chưa xác định', color: 'bg-gray-100 text-gray-700', icon: <FileTextOutlined /> };
    }
  };

  const formatShippingInfo = (shippingInfo?: any) => {
    if (!shippingInfo) return 'Chưa có thông tin giao hàng';
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <UserOutlined className="text-gray-400" />
          <span className="font-semibold">{shippingInfo.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <PhoneOutlined className="text-gray-400" />
          <span>{shippingInfo.phone}</span>
        </div>
        <div className="flex items-start gap-2">
          <EnvironmentOutlined className="text-gray-400 mt-1" />
          <span className="flex-1">
            {`${shippingInfo.address || ''}, ${shippingInfo.ward_name || ''}, ${shippingInfo.district_name || ''}, ${shippingInfo.province_name || ''}`.replace(/, , /g, ', ').replace(/^, |, $/g, '')}
          </span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải lịch sử đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center bg-red-50 rounded-xl p-8">
          <p className="text-red-600 font-semibold">Lỗi khi tải đơn hàng: {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lịch sử mua hàng</h2>
        <p className="text-gray-600">
          Quản lý và theo dõi tất cả đơn hàng của bạn ({orders.length} đơn)
        </p>
      </div>

      {/* Orders List */}
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <ShoppingOutlined className="text-2xl text-blue-600" />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Đơn hàng #{order.id}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <CalendarOutlined />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                  
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-6">
                  {/* Products Preview */}
                  <div className="space-y-3 mb-4">
                    {order.items?.slice(0, 3).map((item) => {
                      const imageUrl = getImageUrl(
                        item.productVariant?.thumb || 
                        item.productVariant?.product?.thumb || 
                        null
                      );
                      
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="w-16 h-16 rounded-lg overflow-hidden shadow-md flex-shrink-0 bg-white">
                            <Image
                              src={imageUrl || '/images/no-image.png'}
                              alt={item.productVariant?.product?.name || 'Sản phẩm'}
                              preview={false}
                              className="w-full h-full object-cover"
                              fallback="/images/no-image.png"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {item.productVariant?.product?.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Số lượng: {item.quantity} × {item.unitPrice?.toLocaleString('vi-VN')}₫
                            </p>
                          </div>
                          {order.status === 'DELIVERED' && (
                            <Link href={`/san-pham/${item.productVariant?.product?.slug}`}>
                              <Button
                                type="primary"
                                icon={<StarOutlined />}
                                className="h-10 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 border-0 rounded-lg font-semibold shadow-md"
                              >
                                Đánh giá
                              </Button>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                    {order.items && order.items.length > 3 && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        +{order.items.length - 3} sản phẩm khác
                      </p>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Tổng thanh toán:</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-blue-600">
                        {order.totalAmount?.toLocaleString('vi-VN')}₫
                      </span>
                      <Button
                        type="primary"
                        onClick={() => showOrderDetails(order)}
                        className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-lg font-semibold shadow-lg"
                      >
                        Xem chi tiết
                      </Button>
                     
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <ShoppingOutlined className="text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium mb-2">Chưa có đơn hàng nào</p>
          <p className="text-gray-400 mb-6">Bắt đầu mua sắm để xem lịch sử đơn hàng</p>
          <Link href="/san-pham">
            <Button
              type="primary"
              icon={<ShoppingOutlined />}
              size="large"
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-lg font-semibold"
            >
              Khám phá sản phẩm
            </Button>
          </Link>
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal
        open={isModalOpen}
        title={
          <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingOutlined className="text-blue-600" />
            Chi tiết đơn hàng #{selectedOrder?.id}
          </div>
        }
        onCancel={handleCloseModal}
        closeIcon={<span className="text-gray-400 hover:text-gray-600 text-xl">×</span>}
        footer={[
          <Button
            key="close"
            onClick={handleCloseModal}
            className="h-11 px-8 rounded-lg font-semibold"
          >
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {selectedOrder && (
          <div className="space-y-6 py-4">
            {/* Status and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Trạng thái đơn hàng</div>
                <div className={`inline-flex px-4 py-2 rounded-full font-semibold ${getStatusConfig(selectedOrder.status).color}`}>
                  {getStatusConfig(selectedOrder.status).icon}
                  <span className="ml-2">{getStatusConfig(selectedOrder.status).text}</span>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="text-sm text-gray-600 mb-1">Phương thức thanh toán</div>
                <div className="font-bold text-gray-900">
                  {selectedOrder.paymentMethod?.name || 'Chưa xác định'}
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <EnvironmentOutlined className="text-purple-600" />
                Thông tin giao hàng
              </h3>
              {formatShippingInfo(selectedOrder.shippingInfo)}
              {selectedOrder.shippingInfo?.note && (
                <div className="mt-4 p-3 bg-white/60 rounded-lg border border-purple-200">
                  <span className="text-sm font-semibold text-gray-700">Ghi chú: </span>
                  <span className="text-sm text-gray-600">{selectedOrder.shippingInfo.note}</span>
                </div>
              )}
            </div>

            {/* Products */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Sản phẩm đã mua</h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item: any) => {
                  const imageUrl = getImageUrl(
                    item.productVariant?.thumb || 
                    item.productVariant?.product?.thumb || 
                    null
                  );
                  
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="w-20 h-20 rounded-lg overflow-hidden shadow-md flex-shrink-0 bg-white">
                        <Image 
                          src={imageUrl || '/images/no-image.png'} 
                          alt="Product" 
                          preview={false}
                          className="w-full h-full object-cover"
                          fallback="/images/no-image.png"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.productVariant?.product?.name}</h4>
                        <p className="text-sm text-gray-500">SKU: {item.productVariant.sku}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.quantity} × {item.unitPrice?.toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {(item.quantity * (item.unitPrice || 0))?.toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/80">Phí vận chuyển:</span>
                <span className="font-semibold text-lg">
                  {(selectedOrder.shippingFee || 0)?.toLocaleString('vi-VN')}₫
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/30">
                <span className="text-xl font-bold">Tổng thanh toán:</span>
                <span className="text-3xl font-bold">
                  {selectedOrder.totalAmount?.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>

            {/* Close Button at Bottom */}
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleCloseModal}
                className="h-11 px-8 rounded-lg font-semibold"
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .ant-modal-header {
          border-bottom: 2px solid #f0f0f0;
          padding: 20px 24px;
        }

        .ant-modal-body {
          padding: 24px;
        }

        .ant-image {
          display: block;
        }
      `}</style>
    </div>
  );
};

export default PurchaseHistory;