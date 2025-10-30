"use client";

import { useState } from "react";
import { Card, Tooltip, Image, Spin, Pagination } from "antd";
import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { useProducts } from "@/hooks/product/useProducts";
import { getImageUrl } from "@/utils/getImageUrl";
import { Product } from "@/types/product.type";
import { formatVND } from "@/utils/helpers";

export default function ProductList() {
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  const {
    data: productsResponse,
    isLoading,
    isError,
  } = useProducts({
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
  });

  const products = (productsResponse?.data as Product[]) || [];
  const totalProducts = productsResponse?.total || 0;

  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-medium animate-pulse">Đang tải sản phẩm...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <p className="text-red-600 font-semibold text-lg">Không thể tải sản phẩm</p>
          <p className="text-gray-500 mt-2">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full mb-4 backdrop-blur-sm border border-pink-200/50">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Bộ sưu tập mới nhất
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Sản phẩm nổi bật
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Khám phá những sản phẩm tuyệt vời được tuyển chọn đặc biệt dành cho bạn
          </p>
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {products.map((p, index) => {
                const thumbUrl = getImageUrl(p.thumb ?? null);

                return (
                  <div
                    key={p.id}
                    className="group relative animate-in fade-in zoom-in duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Card
                      className="relative bg-white rounded-3xl border-2 border-gray-100 hover:border-pink-200 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden h-full"
                      bodyStyle={{ padding: "16px" }}
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-pink-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none"></div>

                      {/* Badge NEW hoặc HOT */}
                      {index < 4 && (
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold py-1.5 px-3 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>HOT</span>
                        </div>
                      )}

                      {/* Product Image */}
                      <Link href={`/san-pham/${p.slug}`}>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/5] mb-4 group-hover:shadow-inner">
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          
                          <Image
                            src={thumbUrl || "/images/no-image.png"}
                            alt={p.name}
                            preview={false}
                            className="w-full h-full object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                          />
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="space-y-2 relative z-10">
                        <Link href={`/san-pham/${p.slug}`}>
                          <h5 className="font-bold text-gray-900 text-sm sm:text-base leading-tight cursor-pointer line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                            <Tooltip title={p.name}>{p.name}</Tooltip>
                          </h5>
                        </Link>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex-1">
                            {p.basePrice ? (
                              <div className="space-y-0.5">
                                <p className="text-transparent bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text font-bold text-lg sm:text-xl">
                                  {formatVND(p.basePrice)}
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-500 font-medium text-sm">Liên hệ</p>
                            )}
                          </div>
                        </div>
                      </div>

                  
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalProducts > PRODUCTS_PER_PAGE && (
              <div className="flex justify-center mt-16">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                  <Pagination
                    current={currentPage}
                    total={totalProducts}
                    pageSize={PRODUCTS_PER_PAGE}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                    className="custom-pagination"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
              <span className="text-5xl">📦</span>
            </div>
            <p className="text-gray-600 text-lg font-medium">Không có sản phẩm nào</p>
            <p className="text-gray-400 mt-2">Hãy quay lại sau nhé!</p>
          </div>
        )}
      </div>
    </section>
  );
}