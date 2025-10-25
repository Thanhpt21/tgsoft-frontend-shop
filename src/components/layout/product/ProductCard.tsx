'use client';

import React from 'react';
import { Card, Tooltip, Image } from 'antd';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Product } from '@/types/product.type';
import { formatVND } from '@/utils/helpers';
import { getImageUrl } from '@/utils/getImageUrl';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const thumbUrl = getImageUrl(product.thumb ?? null);

  return (
    <Card
      hoverable
      className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
      bodyStyle={{ padding: '8px' }}
      headStyle={{ padding: '0' }}
    >
      <div className="p-0 relative overflow-hidden group">
        <div className="relative w-full aspect-square overflow-hidden rounded-md transition-transform duration-300 group-hover:scale-105">
          <Image
            src={thumbUrl || '/images/no-image.png'}
            alt={product.name}
            preview={false}  // không bật preview
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

       
      </div>

      <Link href={`/san-pham/${product.slug}`}>
        <h5 className="font-semibold text-base md:text-lg mb-1 mt-2 cursor-pointer hover:underline truncate">
          <Tooltip title={product.name}>{product.name}</Tooltip>
        </h5>
      </Link>

      <p className="text-gray-600 font-bold text-lg">{formatVND(product.basePrice)}</p>
    </Card>
  );
};
