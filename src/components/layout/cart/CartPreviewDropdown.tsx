'use client';

import React, { useMemo } from 'react';
import { ShoppingCartOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Spin } from 'antd';

// Interface cho props - dùng type 'any' để tránh type mismatch
interface CartPreviewDropdownProps {
  items: any[];
  isLoading: boolean;
  getImageUrl: (url?: string) => string;
  formatVND: (amount: number) => string;
  attributeMap?: Record<number, string>;
  attributeValueMap?: Record<number, string>;
}

// Component hiển thị preview giỏ hàng
const CartPreviewDropdown: React.FC<CartPreviewDropdownProps> = ({ 
  items, 
  isLoading,
  getImageUrl,
  formatVND,
  attributeMap = {},
  attributeValueMap = {}
}) => {
  // Tính tổng giá trị giỏ hàng
  const totalPrice = useMemo(() => {
    return items.reduce((total, item) => {
      const promotion = item.variant?.product?.promotionProducts?.[0];
      const basePrice = item.priceAtAdd;
      let discountedPrice = basePrice;

      if (promotion) {
        if (promotion.discountType === 'PERCENT') {
          discountedPrice = basePrice - (basePrice * promotion.discountValue) / 100;
        } else if (promotion.discountType === 'FIXED') {
          discountedPrice = basePrice - promotion.discountValue;
        }
      }

      return total + (discountedPrice * item.quantity);
    }, 0);
  }, [items]);

  // Render thuộc tính sản phẩm
  const renderAttributes = (attrValues?: Record<string, any>) => {
    if (!attrValues || Object.keys(attrValues).length === 0) return '';
    
    return Object.entries(attrValues)
      .map(([attrId, valueId]) => {
        const attrName = attributeMap[Number(attrId)] || '';
        const valueName = attributeValueMap[Number(valueId)] || '';
        if (!attrName || !valueName) return '';
        return `${attrName}: ${valueName}`;
      })
      .filter(Boolean)
      .join(', ');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full md:w-96 bg-white md:rounded-xl md:shadow-2xl md:border border-gray-100 p-6">
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div className="w-full md:w-96 bg-white md:rounded-xl md:shadow-2xl md:border border-gray-100 p-6">
        <div className="text-center py-8">
          <ShoppingCartOutlined className="text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Giỏ hàng trống</p>
          <Link href="/san-pham">
            <Button type="primary" className="!rounded-lg">
              Khám phá sản phẩm
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Giới hạn hiển thị tối đa 5 sản phẩm
  const displayItems = items.slice(0, 5);
  const hasMore = items.length > 5;

  return (
    // FIX: w-full cho mobile, md:w-[420px] cho desktop
    // FIX: Chỉ bo góc và đổ bóng trên desktop
    <div className="w-full md:w-[420px] bg-white md:rounded-xl md:shadow-2xl md:border border-gray-100 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            Giỏ hàng ({items.length})
          </h3>
          <ShoppingCartOutlined className="text-xl text-blue-600" />
        </div>
      </div>

      {/* Product List */}
      <div className="max-h-[400px] overflow-y-auto flex-1">
        {displayItems.map((item) => {
          const thumb = item.variant?.thumb || item.variant?.product?.thumb;
          const promotion = item.variant?.product?.promotionProducts?.[0];
          const basePrice = item.priceAtAdd;
          let discountedPrice = basePrice;

          if (promotion) {
            if (promotion.discountType === 'PERCENT') {
              discountedPrice = basePrice - (basePrice * promotion.discountValue) / 100;
            } else if (promotion.discountType === 'FIXED') {
              discountedPrice = basePrice - promotion.discountValue;
            }
          }

          return (
            <div 
              key={item.id} 
              className="px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex gap-3">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={getImageUrl(thumb) || '/placeholder.png'}
                      alt={item.variant?.product?.name || 'Sản phẩm'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.variant?.product?.name || 'Sản phẩm không xác định'}
                  </h4>
                  
                  {item.variant?.attrValues && renderAttributes(item.variant.attrValues) && (
                    <p className="text-xs text-gray-500 mb-2">
                      {renderAttributes(item.variant.attrValues)}
                    </p>
                  )}

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      {promotion ? (
                        <>
                          <span className="text-sm font-bold text-blue-600">
                            {formatVND(discountedPrice)}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            {formatVND(basePrice)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-gray-900">
                          {formatVND(basePrice)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      SL: {item.quantity}
                    </span>
                  </div>

                  {/* Item Total */}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Tổng:</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatVND(discountedPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {hasMore && (
          <div className="px-5 py-3 text-center bg-gray-50">
            <span className="text-sm text-gray-600">
              Và {items.length - 5} sản phẩm khác...
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">Tổng cộng:</span>
          <span className="text-xl font-bold text-blue-600">
            {formatVND(totalPrice)}
          </span>
        </div>

        <div className="flex gap-2">
          <Link href="/gio-hang" className="flex-1">
            <Button 
              size="large" 
              className="w-full !rounded-lg"
            >
              Xem giỏ hàng
            </Button>
          </Link>
          <Link href="/dat-hang" className="flex-1">
            <Button 
              type="primary" 
              size="large" 
              className="w-full !rounded-lg"
            >
              Thanh toán
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPreviewDropdown;