'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumb, Card, Button, Empty, message, Tooltip } from 'antd';
import { useWishlist } from '@/stores/useWishlistStore';
import { formatVND } from '@/utils/helpers';
import { XCircle, ShoppingCart, Star } from 'lucide-react';

export default function WishlistPage() {
  const { items: wishlistItems, removeItem } = useWishlist();

  const handleRemoveFromWishlist = (productId: number, productTitle: string) => {
    removeItem(productId);
    message.success(`Đã xóa "${productTitle}" khỏi danh sách yêu thích.`);
  };

  return (
    <div className="container lg:p-12 mx-auto p-4 md:p-8">
      <div className="mb-4">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/">
              Trang chủ
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Danh sách yêu thích</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {wishlistItems.length === 0 ? (
        <Empty
          description="Danh sách yêu thích của bạn đang trống."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Link href="/san-pham">
            <Button type="primary">Duyệt sản phẩm</Button>
          </Link>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {wishlistItems.map((product) => (
            <Card
              key={product.id}
              hoverable
              className="relative border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              bodyStyle={{ padding: '12px' }}
            >
              <Tooltip title="Xóa khỏi danh sách yêu thích">
                <Button
                  type="text"
                  danger
                  icon={<XCircle className="w-5 h-5" />}
                  className="absolute top-2 left-2 z-10 p-0 !border-none !shadow-none rounded-full flex items-center justify-center bg-white/80 transition-colors"
                  onClick={() => handleRemoveFromWishlist(product.id, product.title)}
                  style={{ width: '32px', height: '32px' }}
                />
              </Tooltip>

              <Link href={`/san-pham/${product.slug}`} className="flex flex-col items-start">
                <div className="relative w-full aspect-square overflow-hidden rounded-md mb-3">
                  <Image
                    src={product.thumb}
                    alt={product.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                  />
                </div>
                <h2 className="font-semibold text-lg leading-tight hover:underline truncate w-full">
                  {product.title}
                </h2>
              </Link>

              <div className="flex items-center mt-2 space-x-2">
                {product.discount && product.discount > 0 ? (
                  <>
                    <p className="text-red-500 font-bold text-lg">{formatVND(product.price - product.discount)}</p>
                    <p className="text-gray-500 line-through text-sm">{formatVND(product.price)}</p>
                  </>
                ) : (
                  <p className="text-gray-600 font-bold text-lg">{formatVND(product.price)}</p>
                )}
              </div>

              {product.averageRating !== null && product.averageRating !== undefined && (
                <div className="flex items-center mt-1">
                  {[...Array(Math.round(product.averageRating))].map((_, index) => (
                    <Star key={index} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                  {[...Array(5 - Math.round(product.averageRating))].map((_, index) => (
                    <Star key={`empty-${index}`} className="w-4 h-4 text-gray-300" />
                  ))}
                  {product.ratingCount !== undefined && product.ratingCount > 0 && (
                    <span className="text-gray-500 text-sm ml-1">({product.ratingCount})</span>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}