"use client";

import { Card, Tooltip, Image } from "antd";
import Link from "next/link";
import { getImageUrl } from "@/utils/getImageUrl";
import { Product } from "@/types/product.type";
import { formatVND } from "@/utils/helpers";
import { TrendingUp } from "lucide-react";

interface ProductCardFeaturedProps {
  product: Product;
  index?: number;
}

export default function ProductCardFeatured({ product: p, index = 0 }: ProductCardFeaturedProps) {
  const thumbUrl = getImageUrl(p.thumb ?? null);

  return (
    <div
      className="group relative animate-in fade-in zoom-in duration-500"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Card
        className="relative bg-white rounded-3xl border-2 border-gray-100 hover:border-pink-200 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden h-full"
        bodyStyle={{ padding: "16px" }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-pink-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none"></div>

        {/* Badge HOT (top 4) */}
        {index < 4 && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold py-1.5 px-3 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>HOT</span>
          </div>
        )}

        {/* Image */}
        <Link href={`/san-pham/${p.slug}`}>
          <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/5] mb-4 group-hover:shadow-inner">
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <Image
              src={thumbUrl || "/images/no-image.png"}
              alt={p.name}
              preview={false}
              className="w-full h-full object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
            />
          </div>
        </Link>

        {/* Info */}
        <div className="space-y-2 relative z-10">
          <Link href={`/san-pham/${p.slug}`}>
            <h5 className="font-bold text-gray-900 text-sm sm:text-base leading-tight cursor-pointer line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
              <Tooltip title={p.name}>{p.name}</Tooltip>
            </h5>
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex-1">
              {p.basePrice ? (
                <p className="text-transparent bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text font-bold text-lg sm:text-xl">
                  {formatVND(p.basePrice)}
                </p>
              ) : (
                <p className="text-gray-500 font-medium text-sm">Liên hệ</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}