'use client';

import Link from 'next/link';
import { Product } from '@/types/product.type';
import { useProducts } from '@/hooks/product/useProducts';
import { useCategories } from '@/hooks/category/useCategories';
import { useBrands } from '@/hooks/brand/useBrands';
import { Breadcrumb, Button, Select, Spin, Pagination, Tag } from 'antd';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Brand } from '@/types/brand.type';
import { Category } from '@/types/category.type';
import { ProductCard } from '@/components/layout/product/ProductCard';
import { PlusOutlined, MinusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryIdFromUrl = searchParams.get('categoryId');
  const brandIdFromUrl = searchParams.get('brandId');

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    categoryIdFromUrl ? Number(categoryIdFromUrl) : null
  );
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(
    brandIdFromUrl ? Number(brandIdFromUrl) : null
  );
  const [sortBy, setSortBy] = useState<string | undefined>('createdAt_desc');

  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  const [showCategoriesFilter, setShowCategoriesFilter] = useState(true);
  const [showBrandsFilter, setShowBrandsFilter] = useState(true);

  // Sync state with URL params
  useEffect(() => {
    const categoryId = categoryIdFromUrl ? Number(categoryIdFromUrl) : null;
    const brandId = brandIdFromUrl ? Number(brandIdFromUrl) : null;
    
    setSelectedCategoryId(categoryId);
    setSelectedBrandId(brandId);
    setCurrentPage(1);
  }, [categoryIdFromUrl, brandIdFromUrl]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const areFiltersActive = useMemo(() => {
    return (
      selectedCategoryId !== null ||
      selectedBrandId !== null ||
      searchQuery !== ''
    );
  }, [selectedCategoryId, selectedBrandId, searchQuery]);

  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useProducts({
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
    search: searchQuery,
    brandId: selectedBrandId ?? undefined,
    categoryId: selectedCategoryId ?? undefined,
    sortBy: sortBy,
  });

  const products = productsResponse?.data as Product[] || [];
  const totalProducts = productsResponse?.total || 0;

  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategories({ limit: 100 });
  const allCategories = (categoriesResponse?.data as Category[]) || [];
  const [visibleCategories, setVisibleCategories] = useState<Category[]>([]);
  const [categoriesToShow, setCategoriesToShow] = useState(10);

  useEffect(() => {
    setVisibleCategories(allCategories.slice(0, categoriesToShow));
  }, [allCategories, categoriesToShow]);

  const handleLoadMoreCategories = () => {
    setCategoriesToShow((prev) => prev + 10);
  };

  const { data: brandsResponse, isLoading: isBrandsLoading } = useBrands({ limit: 100 });
  const allBrands = (brandsResponse?.data as Brand[]) || [];
  const [visibleBrands, setVisibleBrands] = useState<Brand[]>([]);
  const [brandsToShow, setBrandsToShow] = useState(10);

  useEffect(() => {
    setVisibleBrands(allBrands.slice(0, brandsToShow));
  }, [allBrands, brandsToShow]);

  const handleLoadMoreBrands = () => {
    setBrandsToShow((prev) => prev + 10);
  };

  // Update URL when filters change
  const updateUrlParams = useCallback((categoryId: number | null, brandId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (categoryId !== null) {
      params.set('categoryId', categoryId.toString());
    } else {
      params.delete('categoryId');
    }
    
    if (brandId !== null) {
      params.set('brandId', brandId.toString());
    } else {
      params.delete('brandId');
    }
    
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    
    const newUrl = params.toString() ? `/san-pham?${params.toString()}` : '/san-pham';
    router.push(newUrl);
  }, [router, searchParams, searchQuery]);

  const handleCategoryClick = (categoryId: number | null) => {
    const newCategoryId = categoryId === selectedCategoryId ? null : categoryId;
    setSelectedCategoryId(newCategoryId);
    setCurrentPage(1);
    updateUrlParams(newCategoryId, selectedBrandId);
  };

  const handleBrandClick = (brandId: number | null) => {
    const newBrandId = brandId === selectedBrandId ? null : brandId;
    setSelectedBrandId(newBrandId);
    setCurrentPage(1);
    updateUrlParams(selectedCategoryId, newBrandId);
  };

  const resetFilters = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedBrandId(null);
    setSortBy('createdAt_desc');
    setCurrentPage(1);
    router.push('/san-pham');
  }, [router]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortOptions = [
    { value: 'createdAt_desc', label: 'Mới nhất' },
    { value: 'createdAt_asc', label: 'Cũ nhất' },
    { value: 'price_asc', label: 'Giá: Thấp đến Cao' },
    { value: 'price_desc', label: 'Giá: Cao đến Thấp' },
  ];

  // Get selected category and brand names for display
  const selectedCategory = allCategories.find(c => c.id === selectedCategoryId);
  const selectedBrand = allBrands.find(b => b.id === selectedBrandId);

  if (isProductsLoading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (isProductsError) {
    return <div className="text-center py-10 text-red-500">Lỗi khi tải sản phẩm.</div>;
  }

  return (
    <div className="container p-4 md:p-8 lg:p-12 mx-auto">
      <div className="mb-6">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {searchQuery ? `Tìm kiếm: "${searchQuery}"` : selectedCategory ? selectedCategory.name : 'Tất cả sản phẩm'}
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* Active Filters Display */}
      {areFiltersActive && (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>
          
          {searchQuery && (
            <Tag
              closable
              onClose={() => router.push('/san-pham')}
              className="px-3 py-1"
            >
              Tìm kiếm: {searchQuery}
            </Tag>
          )}
          
          {selectedCategory && (
            <Tag
              closable
              onClose={() => handleCategoryClick(null)}
              className="px-3 py-1"
            >
              Danh mục: {selectedCategory.name}
            </Tag>
          )}
          
          {selectedBrand && (
            <Tag
              closable
              onClose={() => handleBrandClick(null)}
              className="px-3 py-1"
            >
              Thương hiệu: {selectedBrand.name}
            </Tag>
          )}
          
          {(selectedCategoryId || selectedBrandId) && (
            <Button 
              type="link" 
              size="small" 
              onClick={resetFilters}
              icon={<CloseCircleOutlined />}
            >
              Xóa tất cả
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        <aside className="lg:col-span-2 overflow-y-auto lg:max-h-[calc(100vh-100px)] lg:sticky lg:top-24 pb-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-xl">Bộ lọc</span>
            <Button size="small" onClick={resetFilters}>Đặt lại</Button>
          </div>

          {/* Danh mục */}
          <div className="border-b border-gray-200">
            <div
              className="flex justify-between items-center cursor-pointer py-2"
              onClick={() => setShowCategoriesFilter(!showCategoriesFilter)}
            >
              <span className="font-semibold mb-0">Danh mục</span>
              {showCategoriesFilter ? <MinusOutlined /> : <PlusOutlined />}
            </div>
            {showCategoriesFilter && (
              <ul className="mt-2 mb-4">
                {isCategoriesLoading ? (
                  <Spin size="small" />
                ) : (
                  <>
                    {visibleCategories.map((category) => (
                      <li
                        key={category.id}
                        className={`mb-2 cursor-pointer hover:underline ${selectedCategoryId === category.id ? 'font-bold text-blue-600' : ''}`}
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        {category.name}
                      </li>
                    ))}
                    {allCategories.length > visibleCategories.length && (
                      <li className="mb-2">
                        <Button size="small" onClick={handleLoadMoreCategories}>
                          Xem thêm
                        </Button>
                      </li>
                    )}
                  </>
                )}
              </ul>
            )}
          </div>

          {/* Thương hiệu */}
          <div className="border-b border-gray-200">
            <div
              className="flex justify-between items-center cursor-pointer py-2"
              onClick={() => setShowBrandsFilter(!showBrandsFilter)}
            >
              <span className="font-semibold mb-0">Thương hiệu</span>
              {showBrandsFilter ? <MinusOutlined /> : <PlusOutlined />}
            </div>
            {showBrandsFilter && (
              <ul className="mt-2 mb-4">
                {isBrandsLoading ? (
                  <Spin size="small" />
                ) : (
                  <>
                    {visibleBrands.map((brand) => (
                      <li
                        key={brand.id}
                        className={`mb-2 cursor-pointer hover:underline ${selectedBrandId === brand.id ? 'font-bold text-blue-600' : ''}`}
                        onClick={() => handleBrandClick(brand.id)}
                      >
                        {brand.name}
                      </li>
                    ))}
                    {allBrands.length > visibleBrands.length && (
                      <li className="mb-2">
                        <Button size="small" onClick={handleLoadMoreBrands}>
                          Xem thêm
                        </Button>
                      </li>
                    )}
                  </>
                )}
              </ul>
            )}
          </div>
        </aside>

        <div className="lg:col-span-8">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h3 className="font-bold">
              {searchQuery ? (
                <span>
                  Tìm thấy <span className="text-blue-600">{totalProducts}</span> sản phẩm cho "{searchQuery}"
                </span>
              ) : selectedCategory ? (
                <span>
                  <span className="text-blue-600">{totalProducts}</span> sản phẩm trong "{selectedCategory.name}"
                </span>
              ) : (
                <span className="hidden md:block">
                  Hiển thị {products.length} / {totalProducts} sản phẩm
                </span>
              )}
              <span className="block md:hidden">
                {products.length} sản phẩm
              </span>
            </h3>
            <Select
              value={sortBy}
              style={{ width: 200 }}
              onChange={handleSortChange}
              options={sortOptions}
              placeholder="Sắp xếp theo"
            />
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalProducts > PRODUCTS_PER_PAGE && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    current={currentPage}
                    total={totalProducts}
                    pageSize={PRODUCTS_PER_PAGE}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-2">
                {searchQuery 
                  ? `Không tìm thấy sản phẩm nào phù hợp với "${searchQuery}"`
                  : selectedCategory
                  ? `Không có sản phẩm nào trong danh mục "${selectedCategory.name}"`
                  : 'Không có sản phẩm nào.'
                }
              </p>
              {(searchQuery || selectedCategory) && (
                <Button type="primary" onClick={() => router.push('/san-pham')}>
                  Xem tất cả sản phẩm
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}