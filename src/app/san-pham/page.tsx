"use client";

import Link from "next/link";
import { Product } from "@/types/product.type";
import { useProducts } from "@/hooks/product/useProducts";
import { useCategories } from "@/hooks/category/useCategories";
import { useBrands } from "@/hooks/brand/useBrands";
import {
  Breadcrumb,
  Button,
  Select,
  Spin,
  Pagination,
  Tag,
  Checkbox,
} from "antd";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useTransition,
} from "react";
import { Brand } from "@/types/brand.type";
import { Category } from "@/types/category.type";
import {
  PlusOutlined,
  MinusOutlined,
  CloseCircleOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce"; // Cần tạo hook này

// Import đúng 3 loại card
import ProductCard from "@/components/layout/product/ProductCard";
import ProductCardFeatured from "@/components/layout/product/ProductCardFeatured";
import ProductCardPromoted from "@/components/layout/product/ProductCardPromoted";

// ✅ Tách component để tránh re-render
const FilterItem = React.memo(
  ({
    item,
    isSelected,
    onClick,
    type,
  }: {
    item: Category | Brand;
    isSelected: boolean;
    onClick: () => void;
    type: "category" | "brand";
  }) => (
    <li
      onClick={onClick}
      className={`
      px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 active:scale-95
      ${
        isSelected
          ? type === "category"
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md"
            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-md"
          : "bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600"
      }
    `}
    >
      {item.name}
    </li>
  )
);

FilterItem.displayName = "FilterItem";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ✅ Parse URL params một lần
  const urlParams = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      categoryId: searchParams.get("categoryId")
        ? Number(searchParams.get("categoryId"))
        : null,
      brandId: searchParams.get("brandId")
        ? Number(searchParams.get("brandId"))
        : null,
    }),
    [searchParams]
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    urlParams.categoryId
  );
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(
    urlParams.brandId
  );
  const [sortBy, setSortBy] = useState<string>("createdAt_desc");

  // ✅ CHỈ CẦN 2 CHECKBOX
  const [showFeatured, setShowFeatured] = useState<boolean>(false);
  const [showPromoted, setShowPromoted] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  const [showCategoriesFilter, setShowCategoriesFilter] = useState(true);
  const [showBrandsFilter, setShowBrandsFilter] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ✅ Debounce search để giảm API calls
  const debouncedSearch = useDebounce(urlParams.search, 500);

  // ✅ Sync URL chỉ khi cần thiết
  useEffect(() => {
    if (
      urlParams.categoryId !== selectedCategoryId ||
      urlParams.brandId !== selectedBrandId
    ) {
      setSelectedCategoryId(urlParams.categoryId);
      setSelectedBrandId(urlParams.brandId);
      setCurrentPage(1);
    }
  }, [urlParams.categoryId, urlParams.brandId]);

  // ✅ Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, showFeatured, showPromoted, sortBy]);

  // ✅ Tính areFiltersActive
  const areFiltersActive = useMemo(() => {
    return (
      selectedCategoryId !== null ||
      selectedBrandId !== null ||
      urlParams.search !== "" ||
      showFeatured ||
      showPromoted
    );
  }, [
    selectedCategoryId,
    selectedBrandId,
    urlParams.search,
    showFeatured,
    showPromoted,
  ]);

  // ✅ GỬI FILTER LÊN API (QUAN TRỌNG!)
  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useProducts({
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
    search: debouncedSearch, // ✅ Dùng debounced
    brandId: selectedBrandId ?? undefined,
    categoryId: selectedCategoryId ?? undefined,
    sortBy: sortBy,
    // ✅ THÊM VÀO API PARAMS
    isFeatured: showFeatured ? true : undefined,
    hasPromotion: showPromoted ? true : undefined,
  });

  // ✅ KHÔNG CÒN CLIENT-SIDE FILTERING
  const products = (productsResponse?.data as Product[]) || [];
  const totalProducts = productsResponse?.total || 0;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  // ✅ Fetch categories/brands với limit nhỏ hơn
  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useCategories({ limit: 50 }); // Giảm từ 100 → 50
  const allCategories = (categoriesResponse?.data as Category[]) || [];

  const { data: brandsResponse, isLoading: isBrandsLoading } = useBrands({
    limit: 50,
  }); // Giảm từ 100 → 50
  const allBrands = (brandsResponse?.data as Brand[]) || [];

  // ✅ Dùng useMemo thay vì useState + useEffect
  const visibleCategories = useMemo(
    () => allCategories.slice(0, 10),
    [allCategories]
  );

  const visibleBrands = useMemo(() => allBrands.slice(0, 10), [allBrands]);

  // ✅ Update URL với startTransition để không block UI
  const updateUrlParams = useCallback(
    (categoryId: number | null, brandId: number | null) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (categoryId !== null)
          params.set("categoryId", categoryId.toString());
        else params.delete("categoryId");

        if (brandId !== null) params.set("brandId", brandId.toString());
        else params.delete("brandId");

        if (urlParams.search) params.set("search", urlParams.search);

        const newUrl = params.toString()
          ? `/san-pham?${params.toString()}`
          : "/san-pham";
        router.push(newUrl);
      });
    },
    [router, searchParams, urlParams.search]
  );

  const handleCategoryClick = useCallback(
    (categoryId: number | null) => {
      const newCategoryId =
        categoryId === selectedCategoryId ? null : categoryId;
      setSelectedCategoryId(newCategoryId);
      setCurrentPage(1);
      updateUrlParams(newCategoryId, selectedBrandId);
    },
    [selectedCategoryId, selectedBrandId, updateUrlParams]
  );

  const handleBrandClick = useCallback(
    (brandId: number | null) => {
      const newBrandId = brandId === selectedBrandId ? null : brandId;
      setSelectedBrandId(newBrandId);
      setCurrentPage(1);
      updateUrlParams(selectedCategoryId, newBrandId);
    },
    [selectedBrandId, selectedCategoryId, updateUrlParams]
  );

  const resetFilters = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedBrandId(null);
    setShowFeatured(false);
    setShowPromoted(false);
    setSortBy("createdAt_desc");
    setCurrentPage(1);
    startTransition(() => {
      router.push("/san-pham");
    });
  }, [router]);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ✅ Memoize sort options
  const sortOptions = useMemo(
    () => [
      { value: "createdAt_desc", label: "🆕 Mới nhất" },
      { value: "createdAt_asc", label: "📅 Cũ nhất" },
      { value: "price_asc", label: "💰 Giá: Thấp → Cao" },
      { value: "price_desc", label: "💎 Giá: Cao → Thấp" },
    ],
    []
  );

  const selectedCategory = useMemo(
    () => allCategories.find((c) => c.id === selectedCategoryId),
    [allCategories, selectedCategoryId]
  );

  const selectedBrand = useMemo(
    () => allBrands.find((b) => b.id === selectedBrandId),
    [allBrands, selectedBrandId]
  );

  // ✅ Loading state
  if (isProductsLoading && currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-300 mb-4"></div>
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

  const FilterSidebar = ({
    resetFilters,
    showCategoriesFilter,
    setShowCategoriesFilter,
    showBrandsFilter,
    setShowBrandsFilter,
    isCategoriesLoading,
    isBrandsLoading,
    visibleCategories,
    visibleBrands,
    selectedCategoryId,
    selectedBrandId,
    handleCategoryClick,
    handleBrandClick,
    setShowMobileFilters,
  }: {
    resetFilters: () => void;
    showCategoriesFilter: boolean;
    setShowCategoriesFilter: React.Dispatch<React.SetStateAction<boolean>>;
    showBrandsFilter: boolean;
    setShowBrandsFilter: React.Dispatch<React.SetStateAction<boolean>>;
    isCategoriesLoading: boolean;
    isBrandsLoading: boolean;
    visibleCategories: Category[];
    visibleBrands: Brand[];
    selectedCategoryId: number | null;
    selectedBrandId: number | null;
    handleCategoryClick: (categoryId: number | null) => void;
    handleBrandClick: (brandId: number | null) => void;
    setShowMobileFilters: React.Dispatch<React.SetStateAction<boolean>>;
  }) => (
    <aside className="space-y-4">
      {/* Header Bộ lọc */}
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

      {/* Danh mục */}
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
                  <FilterItem
                    key={category.id}
                    item={category}
                    isSelected={selectedCategoryId === category.id}
                    onClick={() => {
                      handleCategoryClick(category.id);
                      setShowMobileFilters(false);
                    }}
                    type="category"
                  />
                ))}
              </>
            )}
          </ul>
        )}
      </div>

      {/* Thương hiệu */}
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
                  <FilterItem
                    key={brand.id}
                    item={brand}
                    isSelected={selectedBrandId === brand.id}
                    onClick={() => {
                      handleBrandClick(brand.id);
                      setShowMobileFilters(false);
                    }}
                    type="brand"
                  />
                ))}
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
        {/* Breadcrumb - Giống 100% với trang giới thiệu */}
        <div className="border-b border-gray-200 mb-8">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Trang chủ
              </a>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">
                {urlParams.search
                  ? `Tìm kiếm: "${urlParams.search}"`
                  : selectedCategory
                  ? selectedCategory.name
                  : "Sản phẩm"}
              </span>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {areFiltersActive && (
          <div className="mb-6 bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/50">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-gray-700 font-semibold">
                <FilterOutlined className="text-blue-600" />
                <span>Đang lọc:</span>
              </div>

              {urlParams.search && (
                <Tag
                  closable
                  onClose={() => router.push("/san-pham")}
                  className="!px-4 !py-2 !rounded-full !border-2 !border-blue-200 !bg-blue-50 !text-blue-700 font-medium"
                >
                  🔍 {urlParams.search}
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
              {showFeatured && (
                <Tag
                  closable
                  onClose={() => setShowFeatured(false)}
                  className="!px-4 !py-2 !rounded-full !border-2 !border-yellow-200 !bg-yellow-50 !text-yellow-700 font-medium"
                >
                  ⭐ Nổi bật
                </Tag>
              )}
              {showPromoted && (
                <Tag
                  closable
                  onClose={() => setShowPromoted(false)}
                  className="!px-4 !py-2 !rounded-full !border-2 !border-red-200 !bg-red-50 !text-red-700 font-medium"
                >
                  🔥 Khuyến mãi
                </Tag>
              )}
              <Button
                type="link"
                size="small"
                onClick={resetFilters}
                icon={<CloseCircleOutlined />}
                className="!text-red-600 hover:!text-red-700 font-medium"
              >
                Xóa tất cả
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pb-4">
              <FilterSidebar
                resetFilters={resetFilters}
                showCategoriesFilter={showCategoriesFilter}
                setShowCategoriesFilter={setShowCategoriesFilter}
                showBrandsFilter={showBrandsFilter}
                setShowBrandsFilter={setShowBrandsFilter}
                isCategoriesLoading={isCategoriesLoading}
                isBrandsLoading={isBrandsLoading}
                visibleCategories={visibleCategories}
                visibleBrands={visibleBrands}
                selectedCategoryId={selectedCategoryId}
                selectedBrandId={selectedBrandId}
                handleCategoryClick={handleCategoryClick}
                handleBrandClick={handleBrandClick}
                setShowMobileFilters={setShowMobileFilters}
              />
            </div>
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <>
              <div
                className="lg:hidden fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="lg:hidden fixed right-0 top-0 bottom-0 z-[9999] w-full sm:w-96 bg-gradient-to-br from-slate-50 to-blue-50 shadow-2xl flex flex-col">
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-lg">
                  <div className="flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                      <FilterOutlined className="text-2xl" />
                      <h3 className="text-xl font-bold">Lọc sản phẩm</h3>
                    </div>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="text-white hover:bg-white/20 text-2xl w-10 h-10 flex items-center justify-center rounded-lg"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <FilterSidebar
                    resetFilters={resetFilters}
                    showCategoriesFilter={showCategoriesFilter}
                    setShowCategoriesFilter={setShowCategoriesFilter}
                    showBrandsFilter={showBrandsFilter}
                    setShowBrandsFilter={setShowBrandsFilter}
                    isCategoriesLoading={isCategoriesLoading}
                    isBrandsLoading={isBrandsLoading}
                    visibleCategories={visibleCategories}
                    visibleBrands={visibleBrands}
                    selectedCategoryId={selectedCategoryId}
                    selectedBrandId={selectedBrandId}
                    handleCategoryClick={handleCategoryClick}
                    handleBrandClick={handleBrandClick}
                    setShowMobileFilters={setShowMobileFilters}
                  />
                </div>
              </div>
            </>
          )}

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-lg border border-white/50 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Button
                    type="primary"
                    icon={<FilterOutlined />}
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden !h-10 !w-10 flex-shrink-0 !rounded-lg !shadow-md !bg-gradient-to-r !from-blue-600 !to-purple-600 !border-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-0.5 truncate">
                      {urlParams.search ? (
                        <span>
                          {totalProducts > 0
                            ? `Tìm thấy ${totalProducts} sản phẩm`
                            : "Không tìm thấy"}
                        </span>
                      ) : selectedCategory ? (
                        <span className="text-blue-600">
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
                        ? `Hiển thị ${products.length} / ${totalProducts} sản phẩm`
                        : "Không có sản phẩm"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Checkbox
                    checked={showFeatured}
                    onChange={(e) => setShowFeatured(e.target.checked)}
                    className="font-medium"
                  >
                    <span className="text-yellow-600">⭐ Nổi bật</span>
                  </Checkbox>
                  <Checkbox
                    checked={showPromoted}
                    onChange={(e) => setShowPromoted(e.target.checked)}
                    className="font-medium"
                  >
                    <span className="text-red-600">🔥 Khuyến mãi</span>
                  </Checkbox>
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    options={sortOptions}
                    className="w-40 modern-select"
                    size="middle"
                    disabled={products.length === 0}
                  />
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {isPending && (
              <div className="text-center py-4">
                <Spin />
              </div>
            )}

            {products.length > 0 ? (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-lg border border-white/50">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {products.map((product, index) => {
                    const globalIndex =
                      (currentPage - 1) * PRODUCTS_PER_PAGE + index;

                    if (
                      product.promotionProducts &&
                      product.promotionProducts.length > 0
                    ) {
                      return (
                        <ProductCardPromoted
                          key={product.id}
                          product={product}
                          index={globalIndex}
                        />
                      );
                    }
                    if (product.isFeatured) {
                      return (
                        <ProductCardFeatured
                          key={product.id}
                          product={product}
                          index={globalIndex}
                        />
                      );
                    }
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={globalIndex}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
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
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <Pagination
                  current={currentPage}
                  total={totalProducts}
                  pageSize={PRODUCTS_PER_PAGE}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  className="custom-pagination"
                />
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
