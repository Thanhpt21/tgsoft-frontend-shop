"use client";

import { useState } from "react";
import { Image, Rate } from "antd";
import Link from "next/link";
import { getImageUrl } from "@/utils/getImageUrl";
import { useProducts } from "@/hooks/product/useProducts";
import { Product } from "@/types/product.type";
import { formatVND } from "@/utils/helpers";
import { TrendingUp, Clock, Flame } from "lucide-react";

export default function FlashDeals() {
  const PRODUCTS_LIMIT = 8;
  const [page] = useState(1);

  const {
    data: productsResponse,
    isLoading,
    isError,
  } = useProducts({
    page,
    limit: PRODUCTS_LIMIT,
  });

  const products = (productsResponse?.data as Product[]) || [];

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-red-300/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-pink-300/20 to-rose-300/20 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 rounded-full mb-4 backdrop-blur-sm border border-orange-200/50 animate-pulse">
            <Flame className="w-5 h-5 text-orange-500 animate-bounce" />
            <span className="text-sm font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
              ĐANG GIẢM GIÁ SỐC
            </span>
            <Clock className="w-5 h-5 text-red-500" />
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
            ⚡ Flash Sale
          </h2>
          <p className="text-gray-700 text-lg font-medium max-w-2xl mx-auto">
            Giảm giá cực sốc - Số lượng có hạn - Nhanh tay kẻo lỡ!
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden border-2 border-gray-100"
              >
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 aspect-[4/5]"></div>
                <div className="p-3 sm:p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded-full w-1/3"></div>
                  <div className="h-5 bg-gray-300 rounded-full w-full"></div>
                  <div className="h-5 bg-gray-300 rounded-full w-4/5"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
                  <div className="h-6 bg-gradient-to-r from-orange-200 to-red-200 rounded-full w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl border-2 border-red-100">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">😢</span>
              </div>
              <p className="text-red-600 font-bold text-xl mb-2">
                Không thể tải sản phẩm
              </p>
              <p className="text-gray-500">Vui lòng thử lại sau nhé!</p>
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p, index) => {
              const thumbUrl = getImageUrl(p.thumb ?? null);

              // Lấy dữ liệu từ API, nếu chưa có thì dùng giá trị mặc định
              const totalRatings = p.totalRatings || 450; // Tổng điểm rating
              const totalReviews = p.totalReviews || 100; // Tổng số lượt đánh giá
              
              const rating = totalReviews > 0 ? totalRatings / totalReviews : 0;
              const reviewCount = totalReviews;
              const productUrl = `/san-pham/${p.slug || p.id}`;

              return (
                <Link href={productUrl} key={p.id} className="group">
                  <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full border-2 border-gray-100 hover:border-orange-200 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-red-500/0 to-pink-500/0 group-hover:from-orange-500/5 group-hover:via-red-500/5 group-hover:to-pink-500/5 transition-all duration-500 pointer-events-none z-10"></div>

                    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/5] overflow-hidden">
                      
                      {index < 2 && (
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 flex items-center gap-1 bg-gradient-to-r from-red-600 to-pink-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg animate-pulse">
                          <TrendingUp className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                          <span>HOT</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10"></div>

                      <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
                        <Image
                          src={thumbUrl || "/images/no-image.png"}
                          alt={p.name || "Sản phẩm"}
                          preview={false}
                          className="w-full h-full object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                        />
                      </div>
                    </div>

                    <div className="p-3 sm:p-5 flex flex-col flex-grow relative z-10">
                      <div className="inline-flex items-center gap-0.5 sm:gap-1 text-orange-600 text-[9px] sm:text-xs font-bold mb-2 bg-orange-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full w-fit">
                        <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>FLASH DEAL</span>
                      </div>

                      <h3 className="text-gray-900 font-bold text-xs sm:text-base mb-2 sm:mb-3 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-red-600 group-hover:bg-clip-text transition-all duration-300">
                        {p.name || "Chưa có tên"}
                      </h3>

                      <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
                        <Rate
                          disabled
                          allowHalf
                          value={rating}
                          style={{ fontSize: "10px" }}
                          className="text-yellow-400 sm:text-[13px]"
                        />
                        <span className="text-gray-600 font-semibold text-[10px] sm:text-sm">
                          {rating.toFixed(1)}
                        </span>
                        <span className="text-gray-400 text-[9px] sm:text-xs">
                          ({reviewCount})
                        </span>
                      </div>

                      <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-100">
                        <div className="mt-1">
                          <span className="text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text font-black text-base sm:text-2xl">
                            {p.basePrice ? formatVND(p.basePrice) : "Liên hệ"}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:block absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <button className="px-4 py-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300">
                          Mua ngay
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full mb-6">
              <span className="text-5xl">⚡</span>
            </div>
            <p className="text-gray-600 text-xl font-semibold mb-2">
              Chưa có Flash Sale
            </p>
            <p className="text-gray-400">
              Hãy quay lại sau để không bỏ lỡ ưu đãi!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}