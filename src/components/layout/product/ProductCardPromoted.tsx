"use client";

import { Image, Rate } from "antd";
import Link from "next/link";
import { getImageUrl } from "@/utils/getImageUrl";
import { Product } from "@/types/product.type";
import { formatVND } from "@/utils/helpers";
import { Flame, Gift } from "lucide-react";
import { useMemo, useState } from "react";

interface ProductCardPromotedProps {
  product: Product;
  index?: number;
  showOriginalPrice?: boolean;
  showBuyButton?: boolean;
}

export default function ProductCardPromoted({
  product: p,
  index = 0,
  showOriginalPrice = true,
  showBuyButton = true,
}: ProductCardPromotedProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Memoized calculations for better performance
  const { thumbUrl, originalPrice, discountedPrice, promoText, avgRating, productUrl } = useMemo(() => {
    const thumbUrl = getImageUrl(p.thumb ?? null);
    const originalPrice = p.basePrice;
    
    // Tính giá sau khuyến mãi
    const getDiscountedPrice = () => {
      const promo = p.promotionProducts?.[0];
      if (!promo) return originalPrice;

      if (promo.discountType === "PERCENT") {
        return originalPrice * (1 - promo.discountValue / 100);
      }
      if (promo.discountType === "FIXED") {
        return Math.max(0, originalPrice - promo.discountValue);
      }
      return originalPrice;
    };

    const discountedPrice = getDiscountedPrice();

    // Text khuyến mãi
    const getPromoText = () => {
      const promo = p.promotionProducts?.[0];
      if (!promo) return null;

      if (promo.giftProductId && (promo.giftQuantity ?? 0) > 0) {
        return `Tặng ${promo.giftQuantity ?? 0}`;
      }
      if (promo.discountType === "PERCENT") {
        return `-${promo.discountValue}%`;
      }
      if (promo.discountType === "FIXED") {
        return `-${formatVND(promo.discountValue)}`;
      }
      return null;
    };

    const promoText = getPromoText();
    const avgRating = p.totalReviews > 0 ? p.totalRatings / p.totalReviews : 0;
    const productUrl = `/san-pham/${p.slug || p.id}`;

    return { thumbUrl, originalPrice, discountedPrice, promoText, avgRating, productUrl };
  }, [p]);

  // Determine promotion type and styling
  const promotionInfo = useMemo(() => {
    const promo = p.promotionProducts?.[0];
    if (!promo) return null;

    const hasGift = promo.giftProductId && (promo.giftQuantity ?? 0) > 0;
    const hasDiscount = promo.discountType === "PERCENT" || promo.discountType === "FIXED";
    
    // Priority: Gift > Discount > Other
    if (hasGift) {
      return {
        type: "gift",
        text: `Tặng ${promo.giftQuantity}`,
        bgColor: "bg-gradient-to-r from-emerald-500 to-teal-600",
        icon: <Gift className="w-3.5 h-3.5" />,
        discountPercent: null
      };
    } 
    
    if (hasDiscount) {
      const discountPercent = promo.discountType === "PERCENT" 
        ? promo.discountValue 
        : Math.round((promo.discountValue / originalPrice) * 100);
      
      return {
        type: "discount",
        text: promo.discountType === "PERCENT" 
          ? `-${promo.discountValue}%` 
          : `-${formatVND(promo.discountValue)}`,
        bgColor: "bg-gradient-to-r from-orange-500 to-red-500",
        icon: <Flame className="w-3.5 h-3.5" />,
        discountPercent
      };
    }
    
    return null;
  }, [p.promotionProducts, originalPrice]);

  const hasDiscount = useMemo(() => {
    return discountedPrice < originalPrice;
  }, [discountedPrice, originalPrice]);

  return (
    <Link href={productUrl} className="group block h-full">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 hover:border-orange-300 relative">
        {/* Image container */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/5] overflow-hidden">
          {/* Single promotion badge (top-right corner) */}
          {promotionInfo && (
            <div className="absolute top-3 right-3 z-20">
              <div
                className={`flex items-center gap-1.5 text-white text-[11px] sm:text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm ${promotionInfo.bgColor}`}
              >
                {promotionInfo.icon}
                <span className="font-semibold">
                  {promotionInfo.text}
                </span>
              </div>
            </div>
          )}

          {/* Show discount percentage only if it's a discount promotion AND not already shown in badge */}
          {hasDiscount && promotionInfo?.type !== "discount" && (
            <div className="absolute top-3 left-3 z-20">
              <div className="flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 text-white text-xs font-bold px-2 py-1.5 rounded-full shadow-lg min-w-[40px]">
                {Math.round((1 - discountedPrice / originalPrice) * 100)}%
              </div>
            </div>
          )}

          {/* Image loading state */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
          )}

          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 z-10 pointer-events-none" />

          {/* Product image */}
          <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 relative">
            <Image
              src={thumbUrl || "/images/no-image.png"}
              alt={p.name}
              preview={false}
              loading="lazy"
              width={400}
              height={500}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              wrapperClassName="w-full h-full"
              placeholder={
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="w-8 h-8 border-3 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
                </div>
              }
            />
          </div>
        </div>

        {/* Product info */}
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          {/* Product name */}
          <h3 className="text-gray-900 font-semibold text-sm sm:text-base mb-2 line-clamp-2 min-h-[3rem] leading-tight group-hover:text-orange-600 transition-colors duration-300">
            {p.name}
          </h3>

          {/* Rating */}
          {p.totalReviews > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center gap-0.5">
                <div className="text-amber-500 font-bold text-sm">
                  {Math.round(avgRating * 10) / 10}
                </div>
                <div className="text-amber-500">★</div>
              </div>
              <span className="text-gray-400 text-xs whitespace-nowrap">
                ({p.totalReviews})
              </span>
            </div>
          )}

          {/* Price section */}
          <div className="mt-auto pt-2 border-t border-gray-100">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-orange-600 font-bold text-base sm:text-lg whitespace-nowrap">
                {formatVND(discountedPrice)}
              </span>
              
              {showOriginalPrice && hasDiscount && (
                <span className="text-gray-400 line-through text-sm whitespace-nowrap">
                  {formatVND(originalPrice)}
                </span>
              )}
            </div>
            

          </div>

         
        </div>
      </div>
    </Link>
  );
}