"use client";

import { useState } from "react";

import { usePromotedProducts } from "@/hooks/product/usePromotedProducts";
import { Product } from "@/types/product.type";
import { Flame, Clock } from "lucide-react";
import ProductCardPromoted from "../product/ProductCardPromoted";



export default function FlashDeals() {
  const PRODUCTS_LIMIT = 8;
  const [page] = useState(1);

  const { data: productsResponse, isLoading, isError } = usePromotedProducts({
    page,
    limit: PRODUCTS_LIMIT,
  });

  const products = ((productsResponse?.data as Product[]) || []).filter(
    (p) => p.isPublished
  );

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-red-300/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-pink-300/20 to-rose-300/20 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 rounded-full mb-4 backdrop-blur-sm border border-orange-200/50 animate-pulse">
            <Flame className="w-5 h-5 text-orange-500 animate-bounce" />
            <span className="text-sm font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
              ĐANG GIẢM GIÁ SỐC
            </span>
            <Clock className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
            Flash Sale
          </h2>
          <p className="text-gray-700 text-lg font-medium max-w-2xl mx-auto">
            Giảm giá cực sốc - Số lượng có hạn - Nhanh tay kẻo lỡ!
          </p>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden border-2 border-gray-100">
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
          <div className="text-center p-8 bg-white rounded-3xl shadow-xl border-2 border-red-100">
            <p className="text-red-600 font-bold text-xl">Không thể tải sản phẩm</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p, index) => (
              <ProductCardPromoted key={p.id} product={p} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-600 text-xl font-semibold">Chưa có Flash Sale</p>
          </div>
        )}
      </div>
    </section>
  );
}
