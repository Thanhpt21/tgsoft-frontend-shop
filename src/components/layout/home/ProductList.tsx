"use client";

import { useState } from "react";
import { Pagination } from "antd";
import { useNonPromotedProducts } from "@/hooks/product/useNonPromotedProducts";
import { Product } from "@/types/product.type";
import ProductCardFeatured from "../product/ProductCardFeatured";

export default function ProductList() {
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  const { data: productsResponse, isLoading, isError } = useNonPromotedProducts({
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
  });

  const filteredProducts = ((productsResponse?.data as Product[]) || []).filter(
    (p) => p.isPublished && p.isFeatured
  );

  const totalProducts = productsResponse?.total || 0;

  if (isLoading) return <div className="py-20 text-center text-gray-500">Đang tải...</div>;
  if (isError) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header - Minimalist */}
        <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Gợi ý cho bạn
          </h2>
          <div className="w-16 h-1 bg-gray-900 rounded-full mb-4"></div>
          <p className="text-gray-500 max-w-2xl">
            Tuyển tập những sản phẩm xu hướng mới nhất
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {filteredProducts.map((p, index) => (
                <ProductCardFeatured key={p.id} product={p} index={index} />
              ))}
            </div>

            {/* Pagination - Clean */}
            {totalProducts > PRODUCTS_PER_PAGE && (
              <div className="flex justify-center mt-12">
                  <Pagination
                    current={currentPage}
                    total={totalProducts}
                    pageSize={PRODUCTS_PER_PAGE}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                    className="custom-pagination-modern" 
                    // Lưu ý: Cần CSS global đè Antd pagination cho đẹp, hoặc dùng default
                  />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            Không tìm thấy sản phẩm nào
          </div>
        )}
      </div>
    </section>
  );
}