import React from 'react';
import { Checkbox, Image } from 'antd';
import { getImageUrl } from '@/utils/getImageUrl';
import { formatVND } from '@/utils/helpers';
import { GiftProductDisplay } from '../common/GiftProductDisplay';

interface CartItemSummaryProps {
  item: any;
  isSelected: boolean;
  onToggle: () => void;
  renderAttributes: (attrValues: any) => string;
}

export const CartItemSummary = React.memo(({ item, isSelected, onToggle, renderAttributes }: CartItemSummaryProps) => {
  const thumbUrl = getImageUrl(item.variant.thumb || item.variant.product.thumb || '/no-image.png');
  const promotion = item.variant.product.promotionProducts?.[0];

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
      <Checkbox checked={isSelected} onChange={onToggle} />
      <Image
        src={thumbUrl || ''}
        alt={item.variant.product.name}
        width={64}
        height={64}
        className="rounded-lg object-cover flex-shrink-0"
        preview={false}
        fallback="/no-image.png"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.variant.product.name}</p>
        <p className="text-xs text-gray-500 mt-1">{renderAttributes(item.variant.attrValues)}</p>
        {promotion?.giftProductId && (
          <GiftProductDisplay giftProductId={promotion.giftProductId} giftQuantity={promotion.giftQuantity} />
        )}
        <div className="flex justify-between mt-2">
          <span className="text-blue-600 font-semibold">{formatVND(item.finalPrice)}</span>
          <span className="text-gray-500">x {item.quantity}</span>
        </div>
      </div>
    </div>
  );
});