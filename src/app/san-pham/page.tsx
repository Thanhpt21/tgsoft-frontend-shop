'use client';

import { useProducts } from '@/hooks/product/useProducts';
import { Product } from '@/types/product.type';
import { ProductCard } from '@/components/layout/product/ProductCard';
import { Spin, Pagination } from 'antd';
import { useState } from 'react';

export default function ProductsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  const { data: productsResponse, isLoading, isError } = useProducts({
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
  });

  const products = productsResponse?.data as Product[] || [];
  const totalProducts = productsResponse?.total || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Lỗi khi tải sản phẩm
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalProducts > PRODUCTS_PER_PAGE && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={currentPage}
            pageSize={PRODUCTS_PER_PAGE}
            total={totalProducts}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
}
