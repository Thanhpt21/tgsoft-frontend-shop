'use client';

import React from 'react';
import { Image, Tooltip } from 'antd';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Product } from '@/types/product.type';
import { formatVND } from '@/utils/helpers';
import { getImageUrl } from '@/utils/getImageUrl';

interface ProductCardProps {
  product: Product;
  isNew?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isNew = false }) => {
  const thumbUrl = getImageUrl(product.thumb ?? null);

  return (
    <div className="group relative">
      <div className="bg-white rounded-3xl border-2 border-gray-100 hover:border-purple-200 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden h-full flex flex-col relative">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none z-10"></div>

        {/* Badge NEW */}
        {isNew && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-1.5 px-3 rounded-full shadow-lg backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEW</span>
          </div>
        )}

        {/* Product Image */}
        <Link href={`/san-pham/${product.slug}`}>
          <div className="relative w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10"></div>
            
            <div className="w-full h-full p-6 flex items-center justify-center">
              <Image
                src={thumbUrl || '/images/no-image.png'}
                alt={product.name}
                preview={false}
                className="w-full h-full object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
              />
            </div>
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-5 flex flex-col flex-grow relative z-10">
          <Link href={`/san-pham/${product.slug}`}>
            <h5 className="font-bold text-gray-900 text-base leading-tight cursor-pointer line-clamp-2 min-h-[3rem] group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300 mb-3">
              <Tooltip title={product.name}>{product.name}</Tooltip>
            </h5>
          </Link>

          {/* Price Section */}
          <div className="mt-auto">
            <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-black text-xl">
              {formatVND(product.basePrice)}
            </span>
          </div>
        </div>

        {/* Bottom shine effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );
};