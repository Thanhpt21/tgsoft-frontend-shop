"use client";

import { Image, Rate } from "antd";
import Link from "next/link";
import { getImageUrl } from "@/utils/getImageUrl";
import { Product } from "@/types/product.type";
import { formatVND } from "@/utils/helpers";
import { TrendingUp, Flame, Gift, Star } from "lucide-react";

interface ProductCardPromotedProps {
  product: Product;
  index?: number; // Hiển thị badge HOT cho top 2
  showOriginalPrice?: boolean; // Hiển thị giá gạch ngang
  showBuyButton?: boolean; // Hiển thị nút "Mua ngay"
}

export default function ProductCardPromoted({
  product: p,
  index = 0,
  showOriginalPrice = true,
  showBuyButton = true,
}: ProductCardPromotedProps) {
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
      return `Tặng ${promo.giftQuantity ?? 0} ${promo.giftProduct?.name || 'quà'}`;
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

  // Điểm đánh giá trung bình
  const avgRating = p.totalReviews > 0 ? p.totalRatings / p.totalReviews : 0;

  const productUrl = `/san-pham/${p.slug || p.id}`;

  return (
    <Link href={productUrl} className="group">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full border-2 border-gray-100 hover:border-orange-200 relative">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-red-500/0 to-pink-500/0 group-hover:from-orange-500/5 group-hover:via-red-500/5 group-hover:to-pink-500/5 transition-all duration-500 pointer-events-none z-10"></div>

        {/* Image */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/5] overflow-hidden">
          {/* ✅ Badge container - Hiển thị cả HOT (top 2) VÀ Featured */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 flex flex-col items-end gap-1.5 sm:gap-2">
           

            {/* ✅ Badge Featured (nếu isFeatured = true) */}
            {p.isFeatured && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg">
                <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-white" />
                <span>NỔI BẬT</span>
              </div>
            )}
          </div>

          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10"></div>

          <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
            <Image
              src={thumbUrl || "/images/no-image.png"}
              alt={p.name}
              preview={false}
              className="w-full h-full object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
            />
          </div>
        </div>

        {/* Info */}
        <div className="p-3 sm:p-5 flex flex-col flex-grow relative z-10">
          {/* Promo Badge */}
          {promoText && (
            <div
              className="inline-flex items-center gap-0.5 sm:gap-1 text-white text-[9px] sm:text-xs font-bold mb-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full w-fit animate-pulse"
              style={{
                background: promoText.includes('Tặng')
                  ? 'linear-gradient(to right, #10b981, #34d399)'
                  : 'linear-gradient(to right, #f97316, #ef4444)',
              }}
            >
              {promoText.includes('Tặng') ? (
                <Gift className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              ) : (
                <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              )}
              <span>{promoText}</span>
            </div>
          )}

          {/* Tên sản phẩm */}
          <h3 className="text-gray-900 font-bold text-xs sm:text-base mb-2 sm:mb-3 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-red-600 group-hover:bg-clip-text transition-all duration-300">
            {p.name}
          </h3>

          {/* Đánh giá */}
          <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
            <Rate
              disabled
              allowHalf
              value={avgRating}
              style={{ fontSize: "15px" }}
              className="text-yellow-400 sm:text-[13px]"
            />
            <span className="text-gray-400 text-[9px] sm:text-xs">
              ({p.totalReviews})
            </span>
          </div>

          {/* Giá */}
          <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text font-black text-base sm:text-2xl">
                {formatVND(discountedPrice)}
              </span>
              {showOriginalPrice && discountedPrice < originalPrice && (
                <span className="text-gray-400 line-through text-xs sm:text-sm">
                  {formatVND(originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Nút Mua ngay */}
          {showBuyButton && (
            <div className="hidden sm:block absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <button className="px-4 py-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300">
                Mua ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}