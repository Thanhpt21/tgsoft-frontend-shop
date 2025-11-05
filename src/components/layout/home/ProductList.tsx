"use client";

import { useState } from "react";
import { Spin, Pagination } from "antd";
import { Sparkles } from "lucide-react";

import { useNonPromotedProducts } from "@/hooks/product/useNonPromotedProducts";
import { Product } from "@/types/product.type";
import ProductCardFeatured from "../product/ProductCardFeatured";

export default function ProductList() {
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  const {
    data: productsResponse,
    isLoading,
    isError,
  } = useNonPromotedProducts({
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
  });

  const filteredProducts = ((productsResponse?.data as Product[]) || []).filter(
    (p) => p.isPublished && p.isFeatured
  );

  const totalProducts = productsResponse?.total || 0;

  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-300 mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải sản phẩm...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">Lỗi</span>
          </div>
          <p className="text-red-600 font-semibold text-lg">
            Không thể tải sản phẩm
          </p>
          <p className="text-gray-500 mt-2">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
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
            Khám phá những sản phẩm tuyệt vời được tuyển chọn đặc biệt dành cho
            bạn
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {filteredProducts.map((p, index) => (
                <ProductCardFeatured key={p.id} product={p} index={index} />
              ))}
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
              <span className="text-5xl">Hộp</span>
            </div>
            <p className="text-gray-600 text-lg font-medium">
              Không có sản phẩm nào
            </p>
            <p className="text-gray-400 mt-2">Hãy quay lại sau nhé!</p>
          </div>
        )}
      </div>
    </section>
  );
}
