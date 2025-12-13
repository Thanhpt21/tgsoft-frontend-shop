import React, { memo, useState, useEffect } from 'react';
import { Checkbox } from 'antd';
import { getImageUrl } from '@/utils/getImageUrl';
import { formatVND } from '@/utils/helpers';

interface CartItemSummaryProps {
  item: any;
  isSelected: boolean;
  onToggle: () => void;
  renderAttributes: (attrValues: any) => string;
}

// Simple inline gift display để tránh import component nặng
const SimpleGiftDisplay = ({ giftQuantity }: { giftQuantity: number }) => (
  <div className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
    <span>🎁</span>
    <span>Tặng {giftQuantity} sản phẩm</span>
  </div>
);

// Memoized Image component để tránh re-render không cần thiết
const LazyImage = memo(({ 
  src, 
  alt, 
  fallback = '/no-image.png' 
}: { 
  src: string; 
  alt: string; 
  fallback?: string;
}) => {
  const [imageSrc, setImageSrc] = useState(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImageSrc(fallback);
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setImageSrc(fallback);
      setHasError(true);
      setIsLoading(false);
    };
  }, [src, fallback]);

  return (
    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        loading="lazy"
        decoding="async"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export const CartItemSummary = memo(({ 
  item, 
  isSelected, 
  onToggle, 
  renderAttributes 
}: CartItemSummaryProps) => {
  // Sử dụng useMemo để tránh tính toán lại không cần thiết
  const { thumbUrl, productName, attributes, promotion, finalPriceFormatted } = React.useMemo(() => {
    const thumb = item.variant?.thumb || item.variant?.product?.thumb || '';
    const thumbUrl = getImageUrl(thumb) || '/no-image.png';
    const productName = item.variant?.product?.name || 'Sản phẩm';
    const attributes = renderAttributes(item.variant?.attrValues || {});
    const promotion = item.variant?.product?.promotionProducts?.[0];
    const finalPriceFormatted = formatVND(item.finalPrice);
    
    return { 
      thumbUrl, 
      productName, 
      attributes, 
      promotion, 
      finalPriceFormatted 
    };
  }, [item, renderAttributes]);

  // Xử lý toggle với debounce nhẹ
  const handleToggle = React.useCallback(() => {
    requestAnimationFrame(() => {
      onToggle();
    });
  }, [onToggle]);

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-[0.995]">
      <Checkbox 
        checked={isSelected} 
        onChange={handleToggle}
        className="mt-2"
      />
      
      <LazyImage
        src={thumbUrl}
        alt={productName}
        fallback="/no-image.png"
      />
      
      <div className="flex-1 min-w-0">
        <h3 
          className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight"
          title={productName}
        >
          {productName}
        </h3>
        
        {attributes && attributes !== 'Không có thuộc tính' && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {attributes}
          </p>
        )}
        
        {promotion?.giftProductId && promotion.giftQuantity > 0 && (
          <SimpleGiftDisplay giftQuantity={promotion.giftQuantity} />
        )}
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-blue-600 font-semibold text-sm">
            {finalPriceFormatted}
          </span>
          <span className="text-gray-500 text-xs font-medium bg-gray-100 px-2 py-1 rounded">
            x {item.quantity}
          </span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function để tối ưu re-render
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.item.quantity === nextProps.item.quantity &&
    prevProps.item.finalPrice === nextProps.item.finalPrice &&
    prevProps.renderAttributes === nextProps.renderAttributes
  );
});

CartItemSummary.displayName = 'CartItemSummary';