'use client';

import React, { useState } from "react";
import { useCurrent } from "@/hooks/auth/useCurrent";
import { useOrdersByUser } from "@/hooks/order/useOrdersByUser";
import { formatDate } from "@/utils/helpers";
import { Order } from "@/types/order.type";
import { getImageUrl } from "@/utils/getImageUrl";
import Link from "next/link";

const PurchaseHistory: React.FC = () => {
  const { data: currentUser } = useCurrent();
  const userId = currentUser?.id;
  const {
    data: ordersData,
    isLoading,
    isError,
  } = useOrdersByUser({ userId });
  const orders = ordersData?.data ?? [];

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { text: string; color: string }> = {
      "DRAFT": { text: "Đang soạn đơn", color: "bg-gray-100 text-gray-700" },
      "PENDING": { text: "Đang chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
      "PAID": { text: "Đã thanh toán", color: "bg-blue-100 text-blue-700" },
      "SHIPPED": { text: "Đang giao hàng", color: "bg-purple-100 text-purple-700" },
      "DELIVERED": { text: "Đã giao hàng", color: "bg-green-100 text-green-700" },
    };
    return configs[status] || { text: "Chưa xác định", color: "bg-gray-100 text-gray-700" };
  };

  const formatCurrency = (amount: number | undefined) => {
    return (amount || 0).toLocaleString('vi-VN') + '₫';
  };

  // Get image URL helper
  const getProductImageUrl = (item: any) => {
    const thumb = item?.productVariant?.thumb || item?.productVariant?.product?.thumb;
    return thumb ? getImageUrl(thumb) : null;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full py-12">
        <div className="flex flex-col gap-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
          <div className="space-y-4 mt-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="w-full py-12">
        <div className="text-center p-8 bg-red-50 rounded-xl">
          <div className="text-red-600 font-semibold mb-2">Lỗi khi tải đơn hàng</div>
          <p className="text-gray-600">Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Lịch sử mua hàng
        </h2>
        <p className="text-gray-600">
          Quản lý đơn hàng của bạn ({orders.length} đơn)
        </p>
      </div>

      {/* Orders List */}
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const totalAmount = (order.totalAmount || 0) + (order.shippingFee || 0);
            const firstItem = order.items?.[0];
            const itemCount = order.items?.length || 0;
            const productImageUrl = firstItem ? getProductImageUrl(firstItem) : null;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300"
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-gray-900">
                        Đơn hàng #{order.id}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusConfig.color}`}>
                        {statusConfig.text}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(totalAmount)}
                    </div>
                  </div>
                </div>

                {/* Products Preview */}
                <div className="mb-4">
                  {firstItem && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {productImageUrl ? (
                        <img
                          src={productImageUrl}
                          alt={firstItem.productVariant?.product?.name || "Sản phẩm"}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            // Fallback on error
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {firstItem.productVariant?.product?.name || "Sản phẩm"}
                        </div>
                        <div className="text-sm text-gray-500">
                          Số lượng: {firstItem.quantity} × {formatCurrency(firstItem.unitPrice)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {itemCount > 1 && (
                    <div className="mt-2 text-sm text-gray-500 text-center">
                      + {itemCount - 1} sản phẩm khác
                    </div>
                  )}
                </div>

                {/* Order Footer */}
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex-1"
                  >
                    Xem chi tiết
                  </button>
                  
                  {order.status === "DELIVERED" && firstItem?.productVariant?.product?.slug && (
                    <Link
                      href={`/san-pham/${firstItem.productVariant.product.slug}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex-1 text-center"
                    >
                      Đánh giá
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium mb-2">Chưa có đơn hàng nào</p>
          <p className="text-gray-400 mb-6">Bắt đầu mua sắm để xem lịch sử đơn hàng</p>
          <Link href="/san-pham" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 inline-block">
            Khám phá sản phẩm
          </Link>
        </div>
      )}

      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Đơn hàng #{selectedOrder.id}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 text-sm font-medium rounded ${getStatusConfig(selectedOrder.status).color}`}>
                  {getStatusConfig(selectedOrder.status).text}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(selectedOrder.createdAt)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Shipping Info */}
              {/* {selectedOrder.shippingInfo && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Thông tin giao hàng</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedOrder.shippingInfo.name}</span>
                      <span className="text-gray-500">•</span>
                      <span>{selectedOrder.shippingInfo.phone}</span>
                    </div>
                    <div className="text-gray-600">
                      {selectedOrder.shippingInfo.address}, {selectedOrder.shippingInfo.ward_name || ''}, {selectedOrder.shippingInfo.district_name || ''}, {selectedOrder.shippingInfo.province_name || ''}
                    </div>
                    {selectedOrder.shippingInfo.note && (
                      <div className="text-sm text-gray-500 mt-2">
                        Ghi chú: {selectedOrder.shippingInfo.note}
                      </div>
                    )}
                  </div>
                </div>
              )} */}

              {/* Products List */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Sản phẩm đã mua</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any) => {
                    const imageUrl = getProductImageUrl(item);
                    
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.productVariant?.product?.name || "Sản phẩm"}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              // Fallback on error
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">
                            {item.productVariant?.product?.name || "Sản phẩm"}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {item.productVariant?.sku}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold text-blue-600">
                            {formatCurrency((item.unitPrice || 0) * item.quantity)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 p-6 rounded-lg space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Tổng tiền hàng:</span>
                  <span className="font-medium">{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium">{formatCurrency(selectedOrder.shippingFee)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-blue-200">
                  <span className="font-bold text-lg text-gray-900">Tổng thanh toán:</span>
                  <span className="font-bold text-xl text-blue-600">
                    {formatCurrency((selectedOrder.totalAmount || 0) + (selectedOrder.shippingFee || 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;