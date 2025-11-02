"use client";

import Link from "next/link";
import { Product } from "@/types/product.type";
import { useProducts } from "@/hooks/product/useProducts";
import { useCategories } from "@/hooks/category/useCategories";
import { useBrands } from "@/hooks/brand/useBrands";
import { Breadcrumb, Button, Select, Spin, Pagination, Tag } from "antd";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Brand } from "@/types/brand.type";
import { Category } from "@/types/category.type";
import { ProductCard } from "@/components/layout/product/ProductCard";
import {
  PlusOutlined,
  MinusOutlined,
  CloseCircleOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryIdFromUrl = searchParams.get("categoryId");
  const brandIdFromUrl = searchParams.get("brandId");

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    categoryIdFromUrl ? Number(categoryIdFromUrl) : null
  );
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(
    brandIdFromUrl ? Number(brandIdFromUrl) : null
  );
  const [sortBy, setSortBy] = useState<string | undefined>("createdAt_desc");

  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  const [showCategoriesFilter, setShowCategoriesFilter] = useState(true);
  const [showBrandsFilter, setShowBrandsFilter] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const categoryId = categoryIdFromUrl ? Number(categoryIdFromUrl) : null;
    const brandId = brandIdFromUrl ? Number(brandIdFromUrl) : null;

    setSelectedCategoryId(categoryId);
    setSelectedBrandId(brandId);
    setCurrentPage(1);
  }, [categoryIdFromUrl, brandIdFromUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const areFiltersActive = useMemo(() => {
    return (
      selectedCategoryId !== null ||
      selectedBrandId !== null ||
      searchQuery !== ""
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

  const products = (productsResponse?.data as Product[]) || [];
  const totalProducts = productsResponse?.total || 0;

  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useCategories({ limit: 100 });
  const allCategories = (categoriesResponse?.data as Category[]) || [];
  const [visibleCategories, setVisibleCategories] = useState<Category[]>([]);
  const [categoriesToShow, setCategoriesToShow] = useState(10);

  useEffect(() => {
    setVisibleCategories(allCategories.slice(0, categoriesToShow));
  }, [allCategories, categoriesToShow]);

  const handleLoadMoreCategories = () => {
    setCategoriesToShow((prev) => prev + 10);
  };

  const { data: brandsResponse, isLoading: isBrandsLoading } = useBrands({
    limit: 100,
  });
  const allBrands = (brandsResponse?.data as Brand[]) || [];
  const [visibleBrands, setVisibleBrands] = useState<Brand[]>([]);
  const [brandsToShow, setBrandsToShow] = useState(10);

  useEffect(() => {
    setVisibleBrands(allBrands.slice(0, brandsToShow));
  }, [allBrands, brandsToShow]);

  const handleLoadMoreBrands = () => {
    setBrandsToShow((prev) => prev + 10);
  };

  const updateUrlParams = useCallback(
    (categoryId: number | null, brandId: number | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (categoryId !== null) {
        params.set("categoryId", categoryId.toString());
      } else {
        params.delete("categoryId");
      }

      if (brandId !== null) {
        params.set("brandId", brandId.toString());
      } else {
        params.delete("brandId");
      }

      if (searchQuery) {
        params.set("search", searchQuery);
      }

      const newUrl = params.toString()
        ? `/san-pham?${params.toString()}`
        : "/san-pham";
      router.push(newUrl);
    },
    [router, searchParams, searchQuery]
  );

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
    setSortBy("createdAt_desc");
    setCurrentPage(1);
    router.push("/san-pham");
  }, [router]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sortOptions = [
    { value: "createdAt_desc", label: "🆕 Mới nhất" },
    { value: "createdAt_asc", label: "📅 Cũ nhất" },
    { value: "price_asc", label: "💰 Giá: Thấp → Cao" },
    { value: "price_desc", label: "💎 Giá: Cao → Thấp" },
  ];

  const selectedCategory = allCategories.find(
    (c) => c.id === selectedCategoryId
  );
  const selectedBrand = allBrands.find((b) => b.id === selectedBrandId);

  if (isProductsLoading && currentPage === 1) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">
            Đang tải sản phẩm...
          </p>
        </div>
      </div>
    );
  }

  if (isProductsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-red-600 font-semibold">
            Lỗi khi tải sản phẩm
          </p>
        </div>
      </div>
    );
  }

  const FilterSidebar = () => (
    <aside className="space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FilterOutlined className="text-xl" />
            <span className="font-bold text-lg">Bộ lọc</span>
          </div>
          <Button
            size="small"
            onClick={resetFilters}
            className="!bg-white/20 hover:!bg-white/30 !text-white !border-0 !rounded-lg"
          >
            Đặt lại
          </Button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/50">
        <div
          className="flex justify-between items-center cursor-pointer pb-3 border-b border-gray-200"
          onClick={() => setShowCategoriesFilter(!showCategoriesFilter)}
        >
          <span className="font-bold text-lg text-gray-800 flex items-center gap-2">
            📁 Danh mục
          </span>
          <div className="text-blue-600">
            {showCategoriesFilter ? <MinusOutlined /> : <PlusOutlined />}
          </div>
        </div>
        {showCategoriesFilter && (
          <ul className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {isCategoriesLoading ? (
              <div className="text-center py-4">
                <Spin size="small" />
              </div>
            ) : (
              <>
                {visibleCategories.map((category) => (
                  <li
                    key={category.id}
                    className={`
                      px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 active:scale-95
                      ${
                        selectedCategoryId === category.id
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md"
                          : "bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600"
                      }
                    `}
                    onClick={() => {
                      handleCategoryClick(category.id);
                      setShowMobileFilters(false);
                    }}
                  >
                    {category.name}
                  </li>
                ))}
                {allCategories.length > visibleCategories.length && (
                  <li className="pt-2">
                    <Button
                      size="small"
                      onClick={handleLoadMoreCategories}
                      className="w-full !rounded-lg !border-blue-300 !text-blue-600 hover:!bg-blue-50"
                    >
                      Xem thêm danh mục →
                    </Button>
                  </li>
                )}
              </>
            )}
          </ul>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/50">
        <div
          className="flex justify-between items-center cursor-pointer pb-3 border-b border-gray-200"
          onClick={() => setShowBrandsFilter(!showBrandsFilter)}
        >
          <span className="font-bold text-lg text-gray-800 flex items-center gap-2">
            🏷️ Thương hiệu
          </span>
          <div className="text-blue-600">
            {showBrandsFilter ? <MinusOutlined /> : <PlusOutlined />}
          </div>
        </div>
        {showBrandsFilter && (
          <ul className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {isBrandsLoading ? (
              <div className="text-center py-4">
                <Spin size="small" />
              </div>
            ) : (
              <>
                {visibleBrands.map((brand) => (
                  <li
                    key={brand.id}
                    className={`
                      px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 active:scale-95
                      ${
                        selectedBrandId === brand.id
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-md"
                          : "bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-600"
                      }
                    `}
                    onClick={() => {
                      handleBrandClick(brand.id);
                      setShowMobileFilters(false);
                    }}
                  >
                    {brand.name}
                  </li>
                ))}
                {allBrands.length > visibleBrands.length && (
                  <li className="pt-2">
                    <Button
                      size="small"
                      onClick={handleLoadMoreBrands}
                      className="w-full !rounded-lg !border-purple-300 !text-purple-600 hover:!bg-purple-50"
                    >
                      Xem thêm thương hiệu →
                    </Button>
                  </li>
                )}
              </>
            )}
          </ul>
        )}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 w-full">
      <div className="container p-4 md:p-8 lg:p-12 mx-auto">
        <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50">
          <Breadcrumb className="text-sm">
            <Breadcrumb.Item>
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                🏠 Trang chủ
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span className="text-blue-600 font-semibold">
                {searchQuery
                  ? `🔍 Tìm kiếm: "${searchQuery}"`
                  : selectedCategory
                  ? `📁 ${selectedCategory.name}`
                  : "🛍️ Tất cả sản phẩm"}
              </span>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {areFiltersActive && (
          <div className="mb-6 bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/50">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-gray-700 font-semibold">
                <FilterOutlined className="text-blue-600" />
                <span>Đang lọc:</span>
              </div>

              {searchQuery && (
                <Tag
                  closable
                  onClose={() => router.push("/san-pham")}
                  className="!px-4 !py-2 !rounded-full !border-2 !border-blue-200 !bg-blue-50 !text-blue-700 font-medium"
                >
                  🔍 {searchQuery}
                </Tag>
              )}

              {selectedCategory && (
                <Tag
                  closable
                  onClose={() => handleCategoryClick(null)}
                  className="!px-4 !py-2 !rounded-full !border-2 !border-purple-200 !bg-purple-50 !text-purple-700 font-medium"
                >
                  📁 {selectedCategory.name}
                </Tag>
              )}

              {selectedBrand && (
                <Tag
                  closable
                  onClose={() => handleBrandClick(null)}
                  className="!px-4 !py-2 !rounded-full !border-2 !border-pink-200 !bg-pink-50 !text-pink-700 font-medium"
                >
                  🏷️ {selectedBrand.name}
                </Tag>
              )}

              {(selectedCategoryId || selectedBrandId) && (
                <Button
                  type="link"
                  size="small"
                  onClick={resetFilters}
                  icon={<CloseCircleOutlined />}
                  className="!text-red-600 hover:!text-red-700 font-medium"
                >
                  Xóa tất cả
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pb-4">
              <FilterSidebar />
            </div>
          </div>

          {/* Mobile Filter Sidebar - Full Width */}
          {showMobileFilters && (
            <>
              {/* Backdrop */}
              <div
                className="lg:hidden fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                onClick={() => setShowMobileFilters(false)}
              />

              {/* Sidebar */}
              <div
                className="lg:hidden fixed right-0 top-0 bottom-0 z-[9999] w-full sm:w-96 bg-gradient-to-br from-slate-50 to-blue-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Fixed Header */}
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-lg">
                  <div className="flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                      <FilterOutlined className="text-2xl" />
                      <h3 className="text-xl font-bold">Lọc sản phẩm</h3>
                    </div>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="text-white hover:bg-white/20 text-2xl w-10 h-10 flex items-center justify-center rounded-lg transition-colors active:scale-95"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
                  <FilterSidebar />
                </div>
              </div>
            </>
          )}

          {/* Product Grid */}
          <div className="lg:col-span-9">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-lg border border-white/50 mb-6">
              <div className="flex justify-between items-center gap-3">
                {/* Left: Title + Filter Button (Mobile) */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Mobile Filter Button - Inline */}
                  <Button
                    type="primary"
                    icon={<FilterOutlined />}
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="lg:hidden !h-10 !w-10 flex-shrink-0 !rounded-lg !shadow-md !bg-gradient-to-r !from-blue-600 !to-purple-600 !border-0 hover:scale-105 transition-transform"
                  />

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-0.5 truncate">
                      {searchQuery ? (
                        <span>
                          {totalProducts > 0 ? (
                            <>
                              Tìm thấy{" "}
                              <span className="text-blue-600">
                                {totalProducts}
                              </span>{" "}
                              <span className="hidden sm:inline">sản phẩm</span>
                            </>
                          ) : (
                            <span className="text-gray-600">
                              Không tìm thấy
                            </span>
                          )}
                        </span>
                      ) : selectedCategory ? (
                        <span className="text-blue-600 truncate">
                          {selectedCategory.name}
                        </span>
                      ) : (
                        <span>
                          {totalProducts > 0
                            ? "Tất cả sản phẩm"
                            : "Không có sản phẩm"}
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-gray-600 hidden sm:block">
                      {totalProducts > 0
                        ? `Hiển thị ${Math.min(
                            products.length,
                            PRODUCTS_PER_PAGE
                          )} / ${totalProducts} sản phẩm`
                        : "Không có sản phẩm nào"}
                    </p>
                  </div>
                </div>

                {/* Right: Sort Select */}
                <Select
                  value={sortBy}
                  style={{ width: 140 }}
                  onChange={handleSortChange}
                  options={sortOptions}
                  placeholder="Sắp xếp"
                  className="modern-select flex-shrink-0"
                  size="middle"
                  disabled={products.length === 0}
                />
              </div>
            </div>

            {/* ✅ Grid container fix layout width */}
            {/* ✅ Khi có sản phẩm */}
            {products.length > 0 && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-lg border border-white/50">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 w-full">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="transform transition-all duration-300 hover:scale-105"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🚫 Khi không có sản phẩm */}
            {products.length === 0 && (
              <div className="w-full">
                <div className="flex justify-center">
                  <div className="flex flex-col justify-center items-center bg-white rounded-2xl shadow-md p-6 md:p-10 border border-gray-100 text-center w-full">
                    <div className="mb-6 md:mb-8 flex justify-center w-full">
                      <img
                        src="https://cdni.iconscout.com/illustration/premium/thumb/no-product-found-illustration-download-in-svg-png-gif-file-formats--empty-state-search-result-list-page-pack-design-development-illustrations-6430777.png"
                        alt="Không tìm thấy sản phẩm"
                        className="w-48 md:w-64 h-auto mx-auto"
                      />
                    </div>
                   
                    <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 leading-relaxed px-4">
                      {searchQuery
                        ? `Không có sản phẩm nào phù hợp với "${searchQuery}"`
                        : selectedCategory
                        ? `Không có sản phẩm nào trong danh mục "${selectedCategory.name}"`
                        : selectedBrand
                        ? `Không có sản phẩm nào của thương hiệu "${selectedBrand.name}"`
                        : "Không có sản phẩm nào."}
                    </p>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => router.push("/san-pham")}
                      className="!h-12 md:!h-14 !px-8 md:!px-10 !rounded-xl !text-base md:!text-lg font-semibold !bg-gradient-to-r !from-blue-600 !to-purple-600 !border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      🛍️ Xem tất cả sản phẩm
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .modern-select .ant-select-selector {
          border-radius: 8px !important;
          border: 2px solid #e5e7eb !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
        }

        @media (min-width: 768px) {
          .modern-select .ant-select-selector {
            height: 48px !important;
            border-radius: 12px !important;
          }
        }

        .modern-select .ant-select-selector:hover {
          border-color: #3b82f6 !important;
        }

        .modern-select .ant-select-selection-item {
          display: flex !important;
          align-items: center !important;
          font-weight: 500 !important;
        }

        .ant-pagination-item {
          border-radius: 8px !important;
          border: 2px solid #e5e7eb !important;
          font-weight: 600 !important;
        }

        .ant-pagination-item-active {
          background: linear-gradient(
            135deg,
            #3b82f6 0%,
            #8b5cf6 100%
          ) !important;
          border-color: transparent !important;
        }

        .ant-pagination-item-active a {
          color: white !important;
        }

        .ant-pagination-item:hover {
          border-color: #3b82f6 !important;
        }

        .ant-pagination-prev button,
        .ant-pagination-next button {
          border-radius: 8px !important;
        }

        @media (max-width: 768px) {
          .ant-pagination-item {
            min-width: 32px !important;
            height: 32px !important;
            line-height: 30px !important;
            margin: 0 2px !important;
          }

          .ant-pagination-prev,
          .ant-pagination-next {
            min-width: 32px !important;
            height: 32px !important;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .container > * {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
