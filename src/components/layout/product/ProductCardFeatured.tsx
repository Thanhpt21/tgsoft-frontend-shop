"use client";

import { Card, Tooltip, Image } from "antd";
import Link from "next/link";
import { getImageUrl } from "@/utils/getImageUrl";
import { Product } from "@/types/product.type";
import { formatVND } from "@/utils/helpers";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";

interface ProductCardFeaturedProps {
  product: Product;
  index?: number;
}

export default function ProductCardFeatured({ 
  product: p, 
  index = 0 
}: ProductCardFeaturedProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const thumbUrl = useMemo(() => getImageUrl(p.thumb ?? null), [p.thumb]);

  // Calculate discount if exists
  const { discountedPrice, discountPercentage } = useMemo(() => {
    const promo = p.promotionProducts?.[0];
    const originalPrice = p.basePrice;
    let discountedPrice = originalPrice;
    let discountPercentage = 0;

    if (promo) {
      if (promo.discountType === "PERCENT") {
        discountedPrice = originalPrice * (1 - promo.discountValue / 100);
        discountPercentage = promo.discountValue;
      } else if (promo.discountType === "FIXED") {
        discountedPrice = Math.max(0, originalPrice - promo.discountValue);
        discountPercentage = Math.round((promo.discountValue / originalPrice) * 100);
      }
    }

    return { discountedPrice, discountPercentage };
  }, [p.promotionProducts, p.basePrice]);

  const hasDiscount = discountedPrice < p.basePrice;

  // Tính rating và hiển thị
  const ratingInfo = useMemo(() => {
    const avgRating = p.totalReviews > 0 ? p.totalRatings / p.totalReviews : 0;
    const formattedRating = avgRating > 0 ? Math.round(avgRating * 10) / 10 : 0;
    return {
      avgRating: formattedRating,
      totalReviews: p.totalReviews,
      hasRating: p.totalReviews > 0
    };
  }, [p.totalReviews, p.totalRatings]);

  return (
    <div 
      className="group relative"
      style={{ 
        animation: `fadeInUp 0.5s ease-out ${index * 50}ms both`,
      }}
    >
      <Link href={`/san-pham/${p.slug}`} className="block h-full">
        <Card
          className="relative bg-gradient-to-br from-yellow-50/50 to-amber-50/30 rounded-xl sm:rounded-2xl border border-amber-100 hover:border-amber-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full hover:-translate-y-1"
          bodyStyle={{ padding: "12px" }}
          hoverable={false}
        >
          {/* Featured Badge */}
          <div className="absolute top-3 left-3 z-20">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <Star size={12} className="fill-white" />
              <span className="font-semibold">NỔI BẬT</span>
            </div>
          </div>

          {/* Image Container */}
          <div className="relative bg-gradient-to-br from-amber-50/50 to-yellow-50/50 rounded-lg overflow-hidden mb-3 mt-2">
            {/* Discount badge (top-right corner) - moved down because of featured badge */}
            {hasDiscount && discountPercentage > 0 && (
              <div className="absolute top-3 right-3 z-10">
                <div className="flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg min-w-[45px]">
                  -{discountPercentage}%
                </div>
              </div>
            )}

            {/* Gift badge (right side, below discount) */}
            {p.promotionProducts?.[0]?.giftProductId && 
             (p.promotionProducts[0].giftQuantity ?? 0) > 0 && (
              <div className="absolute top-12 right-3 z-10">
                <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg">
                  <span className="font-semibold">Quà tặng</span>
                </div>
              </div>
            )}

            {/* Image với shimmer effect */}
            <div className="relative overflow-hidden aspect-[4/5] flex items-center justify-center">
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-50/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />
              
              {/* Loading skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-yellow-100 animate-pulse" />
              )}
              
              {/* Container để căn giữa hình ảnh */}
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <Image
                  src={thumbUrl || "/images/no-image.png"}
                  alt={p.name}
                  preview={false}
                  loading="lazy"
                  width={320}
                  height={400}
                  onLoad={() => setImageLoaded(true)}
                  className={`max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  wrapperClassName="flex items-center justify-center w-full h-full"
                  placeholder={
                    <div className="w-full h-full flex items-center justify-center bg-amber-100">
                      <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                    </div>
                  }
                />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            {/* Product Name */}
            <Tooltip title={p.name} placement="top">
              <h5 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 min-h-[3rem] group-hover:text-amber-600 transition-colors duration-300 cursor-pointer">
                {p.name}
              </h5>
            </Tooltip>

            {/* Rating - LUÔN HIỂN THỊ */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                {/* Star icons */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={`${
                        star <= Math.floor(ratingInfo.avgRating)
                          ? 'text-amber-500 fill-amber-500'
                          : ratingInfo.avgRating > star - 1 && ratingInfo.avgRating < star
                          ? 'text-amber-500 fill-amber-500 opacity-70'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Rating number - chỉ hiển thị nếu có rating */}
                {ratingInfo.avgRating > 0 && (
                  <div className="text-amber-500 font-bold text-sm ml-1">
                    {ratingInfo.avgRating}
                  </div>
                )}
              </div>
              
              {/* Review count - LUÔN HIỂN THỊ kể cả 0 */}
              <span className="text-gray-400 text-xs whitespace-nowrap">
                ({ratingInfo.totalReviews} đánh giá)
              </span>
            </div>

            {/* Price */}
            <div className="pt-2 border-t border-amber-100">
              {p.basePrice ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600 font-bold text-base sm:text-lg whitespace-nowrap">
                      {formatVND(discountedPrice)}
                    </span>
                    
                    {hasDiscount && (
                      <span className="text-gray-400 line-through text-sm whitespace-nowrap">
                        {formatVND(p.basePrice)}
                      </span>
                    )}
                  </div>
                  
                  {/* Savings info */}
                  {hasDiscount && (
                    <div className="text-emerald-600 text-xs font-medium">
                      Tiết kiệm {formatVND(p.basePrice - discountedPrice)}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 font-medium text-sm">Liên hệ</p>
              )}
            </div>
          </div>
        </Card>
      </Link>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}