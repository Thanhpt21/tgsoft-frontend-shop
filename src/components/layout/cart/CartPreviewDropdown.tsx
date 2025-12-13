// src/components/layout/cart/CartPreviewDropdown.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Spin, Empty, Badge } from "antd";
import { ShoppingCartOutlined, DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { useCartStore } from "@/stores/cartStore";
import type { CartItem } from "@/types/cart.type";

interface CartPreviewDropdownProps {
  items: CartItem[];
  isLoading?: boolean;
  getImageUrl: (url?: string) => string;
  formatVND: (amount: number) => string;
}

const CartPreviewDropdown = ({
  items,
  isLoading = false,
  getImageUrl,
  formatVND,
}: CartPreviewDropdownProps) => {
  const { 
    removeItemOptimistic: removeFromCart, 
    updateQuantityOptimistic: updateQuantity,
    clearSelectedItems
  } = useCartStore();
  
  const [isClient, setIsClient] = useState(false);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const prevItemsRef = useRef<CartItem[]>([]);
  const isFirstLoadRef = useRef(true);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Xử lý loading THÔNG MINH hơn
  useEffect(() => {
    if (!isClient) return;

    // Nếu đang loading từ props
    if (isLoading) {
      setLocalLoading(true);
      return;
    }

    // Nếu items thay đổi từ rỗng sang có dữ liệu (lần đầu load)
    if (isFirstLoadRef.current && items.length > 0) {
      // Hiển thị loading rất ngắn (chỉ 100ms) để tránh flash
      setLocalLoading(true);
      const timer = setTimeout(() => {
        setLocalLoading(false);
        isFirstLoadRef.current = false;
      }, 100);
      
      prevItemsRef.current = items;
      return () => clearTimeout(timer);
    }

    // Nếu items thay đổi nhưng không phải lần đầu
    const prevLength = prevItemsRef.current.length;
    const currentLength = items.length;
    
    if (prevLength !== currentLength && currentLength > 0) {
      // Chỉ hiển thị loading cực ngắn khi số lượng items thay đổi
      setLocalLoading(true);
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 50); // Chỉ 50ms để không nhìn thấy loading
      
      prevItemsRef.current = items;
      return () => clearTimeout(timer);
    }

    // Nếu không có thay đổi gì đặc biệt, không hiển thị loading
    setLocalLoading(false);
    prevItemsRef.current = items;
  }, [items, isLoading, isClient]);

  const handleRemove = async (id: number) => {
    setIsRemoving(id);
    try {
      // Không cần delay nếu muốn responsive nhanh
      removeFromCart(id);
    } finally {
      // Giữ trạng thái removing trong 200ms để feedback visual
      setTimeout(() => setIsRemoving(null), 200);
    }
  };

  const handleQuantityChange = async (variantId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      const item = items.find(item => item.productVariantId === variantId);
      if (item) {
        handleRemove(item.id);
      }
      return;
    }

    setIsUpdating(variantId);
    try {
      // Update ngay lập tức
      updateQuantity(variantId, newQuantity);
    } finally {
      // Giữ trạng thái updating trong 150ms để feedback visual
      setTimeout(() => setIsUpdating(null), 150);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      return total + (item.finalPrice * item.quantity);
    }, 0);
  };

  const calculateTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Helper function để lấy thông tin sản phẩm
  const getProductInfo = (item: CartItem) => {
    const product = item.variant?.product || {
      name: "Sản phẩm không xác định",
      thumb: "",
    };
    
    const variantName = item.variant?.attrValues 
      ? Object.values(item.variant.attrValues).join(", ")
      : "";
    
    return {
      name: product.name + (variantName ? ` (${variantName})` : ""),
      thumb: product.thumb,
      price: item.finalPrice,
      salePrice: item.priceAtAdd,
    };
  };

  // Render loading state - CHỈ hiển thị khi thực sự loading
  if (!isClient || (localLoading && items.length === 0)) {
    return (
      <div className="w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCartOutlined className="text-blue-600 text-lg" />
              <h3 className="font-bold text-gray-800">Giỏ hàng</h3>
            </div>
            <div className="w-6 h-6">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
            <p className="text-sm text-gray-600 mt-4">Đang tải giỏ hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart - HIỂN THỊ NGAY nếu items rỗng và không loading
  if (items.length === 0) {
    return (
      <div className="w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-2">
            <ShoppingCartOutlined className="text-blue-600 text-lg" />
            <h3 className="font-bold text-gray-800">Giỏ hàng</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">Hiển thị sản phẩm trong giỏ</p>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
              <ShoppingCartOutlined className="text-gray-400 text-2xl" />
            </div>
            <h4 className="font-semibold text-gray-700 mb-2">Giỏ hàng trống</h4>
            <p className="text-sm text-gray-500 text-center mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <Link href="/san-pham">
              <Button 
                type="primary" 
                className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !border-0 hover:!from-blue-700 hover:!to-purple-700"
                block
              >
                Mua sắm ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Cart with items - HIỂN THỊ NGAY với data có sẵn
  return (
    <div className="w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCartOutlined className="text-blue-600 text-lg" />
            <h3 className="font-bold text-gray-800">Giỏ hàng</h3>
          </div>
          <Badge 
            count={calculateTotalItems()} 
            className="!bg-gradient-to-r !from-blue-600 !to-purple-600"
            style={{ color: 'white', fontWeight: 'bold' }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{items.length} sản phẩm trong giỏ</p>
      </div>

      {/* Cart Items - Scrollable */}
      <div className="max-h-96 overflow-y-auto">
        {items.map((item) => {
          const productInfo = getProductInfo(item);
          const finalPrice = productInfo.price;
          const isItemRemoving = isRemoving === item.id;
          const isItemUpdating = isUpdating === item.productVariantId;
          
          return (
            <div 
              key={item.id} 
              className={`p-4 border-b border-gray-100 transition-all duration-200 ${
                isItemRemoving ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex gap-3">
                {/* Product Image */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={getImageUrl(productInfo.thumb) || "/images/no-image.png"}
                      alt={productInfo.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full transition-opacity duration-200"
                      style={{ opacity: isItemUpdating || isItemRemoving ? 0.7 : 1 }}
                      unoptimized
                    />
                    {(isItemUpdating || isItemRemoving) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} size="small" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-gray-800 text-sm line-clamp-2">
                      {productInfo.name}
                    </h4>
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={isItemRemoving}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                    >
                      {isItemRemoving ? (
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 12 }} spin />} size="small" />
                      ) : (
                        <DeleteOutlined className="text-sm" />
                      )}
                    </button>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-blue-600">
                      {formatVND(finalPrice)}
                    </span>
                    {productInfo.salePrice && productInfo.salePrice > finalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatVND(productInfo.salePrice)}
                      </span>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuantityChange(item.productVariantId, item.quantity - 1)}
                        disabled={isItemUpdating || isItemRemoving || item.quantity <= 1}
                        className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isItemUpdating ? (
                          <Spin indicator={<LoadingOutlined style={{ fontSize: 10 }} spin />} size="small" />
                        ) : (
                          "–"
                        )}
                      </button>
                      
                      <div className="w-8 text-center">
                        <span className="font-medium">{item.quantity}</span>
                      </div>
                      
                      <button
                        onClick={() => handleQuantityChange(item.productVariantId, item.quantity + 1)}
                        disabled={isItemUpdating || isItemRemoving}
                        className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="font-bold text-gray-800">
                      {formatVND(finalPrice * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Tạm tính:</span>
          <span className="font-bold text-lg text-blue-600">
            {formatVND(calculateSubtotal())}
          </span>
        </div>

        <div className="space-y-2">
          <Link href="/gio-hang">
            <Button 
              type="default" 
              className="w-full !border-gray-300 hover:!border-blue-500"
              size="large"
            >
              Xem giỏ hàng
            </Button>
          </Link>
          
          <Link href="/thanh-toan">
            <Button 
              type="primary" 
              className="w-full !bg-gradient-to-r !from-blue-600 !to-purple-600 !border-0 hover:!from-blue-700 hover:!to-purple-700"
              size="large"
            >
              Thanh toán ngay
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 text-center mt-3">
          Miễn phí vận chuyển cho đơn hàng từ 500K
        </p>
      </div>
    </div>
  );
};

export default CartPreviewDropdown;