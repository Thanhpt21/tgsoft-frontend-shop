"use client";

import Link from "next/link";
import { Product } from "@/types/product.type";
import { useProducts } from "@/hooks/product/useProducts";
import { useCategories } from "@/hooks/category/useCategories";
import { useBrands } from "@/hooks/brand/useBrands";
import {
  Button,
  Select,
  Pagination,
  Tag,
  Checkbox,
  Spin,
} from "antd";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Brand } from "@/types/brand.type";
import { Category } from "@/types/category.type";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search,
  ChevronDown,
  TrendingUp,
  Filter,
  Package,
  Tag as TagIcon,
  Home,
  ChevronRight,
} from "lucide-react";

// ✅ Import trực tiếp, không dùng lazy loading để tránh giật khi scroll
import ProductCard from "@/components/layout/product/ProductCard";
import ProductCardFeatured from "@/components/layout/product/ProductCardFeatured";
import ProductCardPromoted from "@/components/layout/product/ProductCardPromoted";

// ✅ Simple Filter Item Component
const FilterItem = ({
  item,
  isSelected,
  onClick,
  type,
  isLoading = false,
}: {
  item: Category | Brand;
  isSelected: boolean;
  onClick: () => void;
  type: "category" | "brand";
  isLoading?: boolean;
}) => {
  const getColors = () => {
    if (type === "category") {
      return {
        bg: isSelected 
          ? "bg-gradient-to-r from-blue-500 to-blue-600" 
          : "bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100",
        text: isSelected ? "text-white" : "text-gray-700",
        border: isSelected 
          ? "border-transparent" 
          : "border-gray-200 hover:border-blue-300",
        shadow: isSelected ? "shadow-lg shadow-blue-500/20" : "shadow-sm",
      };
    } else {
      return {
        bg: isSelected 
          ? "bg-gradient-to-r from-purple-500 to-purple-600" 
          : "bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-purple-100",
        text: isSelected ? "text-white" : "text-gray-700",
        border: isSelected 
          ? "border-transparent" 
          : "border-gray-200 hover:border-purple-300",
        shadow: isSelected ? "shadow-lg shadow-purple-500/20" : "shadow-sm",
      };
    }
  };

  const colors = getColors();

  return (
    <li
      onClick={onClick}
      className={`
        relative px-4 py-3 rounded-xl cursor-pointer select-none
        transition-all duration-150
        ${colors.bg}
        border ${colors.border}
        ${colors.shadow}
        ${isLoading ? 'opacity-80' : ''}
        active:scale-[0.98]
      `}
    >
      <div className="flex items-center justify-between relative z-10">
        <span className={`font-medium truncate ${colors.text}`}>
          {item.name}
        </span>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="w-4 h-4">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {isSelected && !isLoading && (
            <div className={`
              w-2 h-2 rounded-full
              ${type === 'category' ? 'bg-blue-100' : 'bg-purple-100'}
            `}></div>
          )}
        </div>
      </div>
    </li>
  );
};

// ✅ Custom Breadcrumb Component cho mobile và desktop
const ProductBreadcrumb = ({ 
  searchTerm,
  selectedCategory,
  selectedBrand,
  showFeatured,
  showPromoted,
  currentPage,
  totalPages 
}: { 
  searchTerm?: string | null;
  selectedCategory?: Category | null;
  selectedBrand?: Brand | null;
  showFeatured: boolean;
  showPromoted: boolean;
  currentPage: number;
  totalPages: number;
}) => {
  // Mobile Breadcrumb (compact)
  const MobileBreadcrumb = () => (
    <div className="lg:hidden flex items-center justify-between bg-white px-4 py-3 border-b mb-4">
      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span className="text-sm font-medium">Quay lại</span>
      </button>

      {/* Current page info */}
      <div className="text-xs text-gray-500">
        {currentPage > 1 && `Trang ${currentPage}`}
      </div>
    </div>
  );

  // Desktop Breadcrumb (full)
  const DesktopBreadcrumb = () => (
    <nav className="hidden lg:block bg-white border-b">
      <div className="max-w-[1400px] mx-auto px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {/* Home */}
          <Link
            href="/"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <Home size={14} />
            <span>Trang chủ</span>
          </Link>
          
          <ChevronRight className="w-3 h-3 text-gray-400" />
          
          {/* Sản phẩm */}
          <Link
            href="/san-pham"
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            Sản phẩm
          </Link>
          
          {/* Category (nếu có) */}
          {selectedCategory && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <Link
                href={`/san-pham?categoryId=${selectedCategory.id}`}
                className="text-gray-500 hover:text-blue-600 transition-colors truncate max-w-[150px]"
              >
                {selectedCategory.name}
              </Link>
            </>
          )}
          
          {/* Brand (nếu có) */}
          {selectedBrand && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="text-gray-500 truncate max-w-[120px]">
                {selectedBrand.name}
              </span>
            </>
          )}
          
          {/* Search term (nếu có) */}
          {searchTerm && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="text-gray-700 font-medium truncate max-w-[180px]">
                "{searchTerm}"
              </span>
            </>
          )}
          
          {/* Featured (nếu có) */}
          {showFeatured && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="text-yellow-600 font-medium">
                Nổi bật
              </span>
            </>
          )}
          
          {/* Promoted (nếu có) */}
          {showPromoted && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="text-red-600 font-medium">
                Khuyến mãi
              </span>
            </>
          )}
          
          {/* Current page (nếu > 1) */}
          {currentPage > 1 && totalPages > 1 && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="text-gray-900 font-medium">
                Trang {currentPage}
              </span>
            </>
          )}
          
          {/* Default: Tất cả sản phẩm */}
          {!searchTerm && !selectedCategory && !selectedBrand && !showFeatured && !showPromoted && currentPage === 1 && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="text-gray-900 font-medium">
                Tất cả sản phẩm
              </span>
            </>
          )}
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <MobileBreadcrumb />
      <DesktopBreadcrumb />
    </>
  );
};

// ✅ Simple Skeleton Component cho loading state
const ProductCardSkeleton = () => (
  <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-100 shadow-sm">
    <div className="p-4">
      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4 animate-pulse"></div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 animate-pulse"></div>
          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
        </div>
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 animate-pulse"></div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 animate-pulse"></div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

// ✅ Main Component - CHỈ DÙNG PAGINATION, KHÔNG DÙNG INFINITE SCROLL
export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management - LOẠI BỎ INFINITE SCROLL STATES
  const [showLightLoading, setShowLightLoading] = useState(false);
  const [isGridRefreshing, setIsGridRefreshing] = useState(false);
  const [loadingFilterId, setLoadingFilterId] = useState<number | null>(null);
  const [loadingFilterType, setLoadingFilterType] = useState<'category' | 'brand' | null>(null);
  const [pendingPromoted, setPendingPromoted] = useState(false);

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const filterLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // QUAN TRỌNG: Parse URL params - ĐỌC TRỰC TIẾP TỪ URL MỖI LẦN RENDER
  const getCurrentParams = useCallback(() => ({
    search: searchParams.get("search") || "",
    categoryId: searchParams.get("categoryId")
      ? Number(searchParams.get("categoryId"))
      : null,
    brandId: searchParams.get("brandId")
      ? Number(searchParams.get("brandId"))
      : null,
    hasPromotion: searchParams.get("hasPromotion") === "true",
    isFeatured: searchParams.get("isFeatured") === "true",
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
  }), [searchParams]);

  // State cho các filter
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    getCurrentParams().categoryId
  );
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(
    getCurrentParams().brandId
  );
  const [sortBy, setSortBy] = useState<string>("createdAt_desc");
  
  const [showFeatured, setShowFeatured] = useState<boolean>(getCurrentParams().isFeatured);
  const [showPromoted, setShowPromoted] = useState<boolean>(getCurrentParams().hasPromotion);
  
  const [currentPage, setCurrentPage] = useState(getCurrentParams().page);
  const PRODUCTS_PER_PAGE = 12;

  // State cho dropdown
  const [showCategoriesFilter, setShowCategoriesFilter] = useState(true);
  const [showBrandsFilter, setShowBrandsFilter] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Debounce search
  const debouncedSearch = useDebounce(getCurrentParams().search, 300);

  // QUAN TRỌNG: Đồng bộ state với URL khi URL thay đổi
  useEffect(() => {
    const params = getCurrentParams();
    
    // Cập nhật state từ URL
    setSelectedCategoryId(params.categoryId);
    setSelectedBrandId(params.brandId);
    setShowFeatured(params.isFeatured);
    setShowPromoted(params.hasPromotion);
    setCurrentPage(params.page);
  }, [searchParams, getCurrentParams]);

  // ✅ FIX: Hàm để build URL params đầy đủ
  const buildUrlParams = useCallback((options: {
    categoryId?: number | null;
    brandId?: number | null;
    search?: string;
    hasPromotion?: boolean;
    isFeatured?: boolean;
    page?: number;
  } = {}) => {
    const params = new URLSearchParams();
    
    const catId = options.categoryId !== undefined ? options.categoryId : selectedCategoryId;
    const brId = options.brandId !== undefined ? options.brandId : selectedBrandId;
    const search = options.search !== undefined ? options.search : getCurrentParams().search;
    const promoted = options.hasPromotion !== undefined ? options.hasPromotion : showPromoted;
    const featured = options.isFeatured !== undefined ? options.isFeatured : showFeatured;
    const page = options.page !== undefined ? options.page : currentPage;
    
    if (catId !== null) params.set("categoryId", catId.toString());
    if (brId !== null) params.set("brandId", brId.toString());
    if (search) params.set("search", search);
    if (promoted) params.set("hasPromotion", "true");
    if (featured) params.set("isFeatured", "true");
    if (page > 1) params.set("page", page.toString());
    
    return params.toString();
  }, [selectedCategoryId, selectedBrandId, getCurrentParams, showPromoted, showFeatured, currentPage]);

  // ✅ QUAN TRỌNG: Fetch products với đầy đủ params - SỬ DỤNG GETCURRENTPARAMS()
  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useProducts({
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
    search: debouncedSearch,
    brandId: selectedBrandId ?? undefined,
    categoryId: selectedCategoryId ?? undefined,
    sortBy: sortBy,
    isFeatured: showFeatured ? true : undefined,
    hasPromotion: showPromoted ? true : undefined,
  });

  const products = (productsResponse?.data as Product[]) || [];
  const totalProducts = productsResponse?.total || 0;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (filterLoadingTimeoutRef.current) clearTimeout(filterLoadingTimeoutRef.current);
    };
  }, []);

  // Tối ưu grid refresh
  useEffect(() => {
    if (isProductsLoading) {
      setIsGridRefreshing(true);
    } else {
      scrollTimeoutRef.current = setTimeout(() => {
        setIsGridRefreshing(false);
      }, 50);
    }
    
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isProductsLoading]);

  // Fetch categories and brands
  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useCategories({ limit: 50 });
  const allCategories = (categoriesResponse?.data as Category[]) || [];

  const { data: brandsResponse, isLoading: isBrandsLoading } = useBrands({
    limit: 50,
  });
  const allBrands = (brandsResponse?.data as Brand[]) || [];

  const visibleCategories = useMemo(
    () => allCategories.slice(0, 15),
    [allCategories]
  );

  const visibleBrands = useMemo(() => allBrands.slice(0, 15), [allBrands]);

  // ✅ QUAN TRỌNG: Cập nhật URL khi checkbox thay đổi - RESET VỀ PAGE 1
  const handlePromotedChange = useCallback((checked: boolean) => {
    setShowLightLoading(true);
    setPendingPromoted(true);
    
    // Cập nhật state và reset về page 1
    setShowPromoted(checked);
    setCurrentPage(1);
    
    // Build URL với giá trị mới và page = 1
    const params = new URLSearchParams();
    if (selectedCategoryId !== null) params.set("categoryId", selectedCategoryId.toString());
    if (selectedBrandId !== null) params.set("brandId", selectedBrandId.toString());
    if (getCurrentParams().search) params.set("search", getCurrentParams().search);
    if (showFeatured) params.set("isFeatured", "true");
    if (checked) params.set("hasPromotion", "true");
    // Không thêm page vì đang là page 1
    
    router.replace(`/san-pham?${params.toString()}`, { scroll: false });
    
    // Reset loading state
    setTimeout(() => {
      setShowLightLoading(false);
      setPendingPromoted(false);
    }, 300);
  }, [selectedCategoryId, selectedBrandId, getCurrentParams, showFeatured, router]);

  const handleFeaturedChange = useCallback((checked: boolean) => {
    setShowLightLoading(true);
    
    setShowFeatured(checked);
    setCurrentPage(1);
    
    const params = new URLSearchParams();
    if (selectedCategoryId !== null) params.set("categoryId", selectedCategoryId.toString());
    if (selectedBrandId !== null) params.set("brandId", selectedBrandId.toString());
    if (getCurrentParams().search) params.set("search", getCurrentParams().search);
    if (showPromoted) params.set("hasPromotion", "true");
    if (checked) params.set("isFeatured", "true");
    
    router.replace(`/san-pham?${params.toString()}`, { scroll: false });
    
    setTimeout(() => {
      setShowLightLoading(false);
    }, 300);
  }, [selectedCategoryId, selectedBrandId, getCurrentParams, showPromoted, router]);

  // Optimized filter click handlers - SỬA ĐỂ DÙNG GETCURRENTPARAMS()
  const handleCategoryClick = useCallback((categoryId: number | null) => {
    if (categoryId === selectedCategoryId && categoryId !== null) return;
    
    const newCategoryId = categoryId === selectedCategoryId ? null : categoryId;
    
    setLoadingFilterId(categoryId);
    setLoadingFilterType('category');
    setShowLightLoading(true);
    
    // Cập nhật state
    setSelectedCategoryId(newCategoryId);
    setCurrentPage(1); // ✅ RESET VỀ PAGE 1
    
    // Build URL với giá trị mới
    const params = new URLSearchParams();
    if (newCategoryId !== null) params.set("categoryId", newCategoryId.toString());
    
    // Giữ search nếu có (tùy chọn - bạn có thể xóa nếu muốn)
    const currentSearch = getCurrentParams().search;
    if (currentSearch) params.set("search", currentSearch);
    
    // Xóa các filter khác khi chọn category mới
    params.delete("brandId");
    params.delete("hasPromotion");
    params.delete("isFeatured");
    
    router.replace(`/san-pham?${params.toString()}`, { scroll: false });
    
    filterLoadingTimeoutRef.current = setTimeout(() => {
      setLoadingFilterId(null);
      setLoadingFilterType(null);
      setShowLightLoading(false);
    }, 300);
  }, [selectedCategoryId, getCurrentParams, router]);

  const handleBrandClick = useCallback((brandId: number | null) => {
    if (brandId === selectedBrandId && brandId !== null) return;
    
    const newBrandId = brandId === selectedBrandId ? null : brandId;
    
    setLoadingFilterId(brandId);
    setLoadingFilterType('brand');
    setShowLightLoading(true);
    
    setSelectedBrandId(newBrandId);
    setCurrentPage(1); // ✅ RESET VỀ PAGE 1
    
    const params = new URLSearchParams();
    if (newBrandId !== null) params.set("brandId", newBrandId.toString());
    
    // Giữ category nếu có
    const currentCategoryId = getCurrentParams().categoryId;
    if (currentCategoryId) params.set("categoryId", currentCategoryId.toString());
    
    // Giữ search nếu có
    const currentSearch = getCurrentParams().search;
    if (currentSearch) params.set("search", currentSearch);
    
    // Xóa các filter khác khi chọn brand mới
    params.delete("hasPromotion");
    params.delete("isFeatured");
    
    router.replace(`/san-pham?${params.toString()}`, { scroll: false });
    
    filterLoadingTimeoutRef.current = setTimeout(() => {
      setLoadingFilterId(null);
      setLoadingFilterType(null);
      setShowLightLoading(false);
    }, 300);
  }, [selectedBrandId, getCurrentParams, router]);

  const resetFilters = useCallback(() => {
    setShowLightLoading(true);
    
    // Reset tất cả state
    setSelectedCategoryId(null);
    setSelectedBrandId(null);
    setShowFeatured(false);
    setShowPromoted(false);
    setSortBy("createdAt_desc");
    setCurrentPage(1);
    
    // Chỉ chuyển đến /san-pham không có params
    router.replace("/san-pham", { scroll: false });
    
    setTimeout(() => {
      setShowLightLoading(false);
    }, 300);
  }, [router]);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
    setCurrentPage(1); // ✅ RESET VỀ PAGE 1 KHI SORT
  }, []);

  // ✅ FIX: Hàm xử lý phân trang - CẬP NHẬT URL
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    
    // Build URL với page mới
    const params = new URLSearchParams();
    if (selectedCategoryId !== null) params.set("categoryId", selectedCategoryId.toString());
    if (selectedBrandId !== null) params.set("brandId", selectedBrandId.toString());
    if (getCurrentParams().search) params.set("search", getCurrentParams().search);
    if (showPromoted) params.set("hasPromotion", "true");
    if (showFeatured) params.set("isFeatured", "true");
    if (page > 1) params.set("page", page.toString()); // ✅ CHỈ THÊM PAGE KHI > 1
    
    router.replace(`/san-pham?${params.toString()}`, { scroll: false });
    
    // Scroll lên đầu trang
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }, [selectedCategoryId, selectedBrandId, getCurrentParams, showPromoted, showFeatured, router]);

  const sortOptions = useMemo(
    () => [
      { value: "createdAt_desc", label: "Mới nhất" },
      { value: "createdAt_asc", label: "Cũ nhất" },
      { value: "price_asc", label: "Giá: Thấp → Cao" },
      { value: "price_desc", label: "Giá: Cao → Thấp" },
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

  // Loading state
  if (isProductsLoading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white w-full">
        {/* Skeleton Breadcrumb */}
        <div className="hidden lg:block bg-white border-b">
          <div className="max-w-[1400px] mx-auto px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
              <div className="h-4 w-4 text-gray-400">›</div>
              <div className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Filters skeleton */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="space-y-6">
                <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
                <div className="h-64 bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl border border-gray-200 animate-pulse"></div>
                <div className="h-48 bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl border border-gray-200 animate-pulse"></div>
              </div>
            </div>

            {/* Products skeleton */}
            <div className="lg:col-span-9">
              <div className="h-32 bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl border border-gray-200 mb-6 animate-pulse"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isProductsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mb-4">
            <div className="text-3xl">⚠️</div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Đã xảy ra lỗi
          </h3>
          <p className="text-gray-600 mb-6">
            Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.
          </p>
          <Button
            type="primary"
            size="large"
            onClick={() => window.location.reload()}
            className="!bg-gradient-to-r !from-blue-600 !to-blue-700 !border-0 hover:!from-blue-700 hover:!to-blue-800"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white w-full">
      {/* Light Loading Overlay */}
      {showLightLoading && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* ✅ CUSTOM BREADCRUMB */}
      <ProductBreadcrumb
        searchTerm={getCurrentParams().search || undefined}
        selectedCategory={selectedCategory || undefined}
        selectedBrand={selectedBrand || undefined}
        showFeatured={showFeatured}
        showPromoted={showPromoted}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 py-4 lg:py-8">
        {/* Active Filters Bar */}
        {(selectedCategoryId || selectedBrandId || showFeatured || showPromoted || getCurrentParams().search || currentPage > 1) && (
          <div className="mb-6 lg:mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 font-medium text-blue-700">
                <Filter size={16} />
                <span>Bộ lọc đang áp dụng:</span>
              </div>

              {getCurrentParams().search && (
                <Tag
                  closable
                  onClose={() => {
                    const params = new URLSearchParams();
                    if (selectedCategoryId) params.set("categoryId", selectedCategoryId.toString());
                    if (selectedBrandId) params.set("brandId", selectedBrandId.toString());
                    if (showPromoted) params.set("hasPromotion", "true");
                    if (showFeatured) params.set("isFeatured", "true");
                    if (currentPage > 1) params.set("page", currentPage.toString());
                    router.replace(params.toString() ? `/san-pham?${params.toString()}` : "/san-pham", { scroll: false });
                  }}
                  className="!px-3 !py-1.5 !rounded-full !bg-white !text-blue-700 !border-blue-300 shadow-sm"
                >
                  {getCurrentParams().search}
                </Tag>
              )}
              
              {selectedCategory && (
                <Tag
                  closable
                  onClose={() => handleCategoryClick(null)}
                  className="!px-3 !py-1.5 !rounded-full !bg-white !text-purple-700 !border-purple-300 shadow-sm"
                >
                  {selectedCategory.name}
                </Tag>
              )}
              
              {selectedBrand && (
                <Tag
                  closable
                  onClose={() => handleBrandClick(null)}
                  className="!px-3 !py-1.5 !rounded-full !bg-white !text-pink-700 !border-pink-300 shadow-sm"
                >
                  {selectedBrand.name}
                </Tag>
              )}
              
              {showFeatured && (
                <Tag
                  closable
                  onClose={() => handleFeaturedChange(false)}
                  className="!px-3 !py-1.5 !rounded-full !bg-gradient-to-r !from-yellow-50 !to-amber-50 !text-amber-700 !border-amber-300 shadow-sm"
                >
                  Nổi bật
                </Tag>
              )}
              
              {showPromoted && (
                <Tag
                  closable
                  onClose={() => handlePromotedChange(false)}
                  className="!px-3 !py-1.5 !rounded-full !bg-gradient-to-r !from-red-50 !to-pink-50 !text-red-700 !border-red-300 shadow-sm"
                >
                  Khuyến mãi
                </Tag>
              )}

              {currentPage > 1 && (
                <Tag
                  closable
                  onClose={() => handlePageChange(1)}
                  className="!px-3 !py-1.5 !rounded-full !bg-gradient-to-r !from-green-50 !to-emerald-50 !text-emerald-700 !border-emerald-300 shadow-sm"
                >
                  Trang {currentPage}
                </Tag>
              )}
              
              <Button
                type="link"
                size="small"
                onClick={resetFilters}
                className="!text-gray-500 hover:!text-red-600 ml-auto"
              >
                Xóa tất cả
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Filter Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2">
                  <Filter size={20} />
                  <span className="font-bold text-lg">Bộ lọc</span>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div
                  className="flex justify-between items-center cursor-pointer p-4 hover:bg-gray-50 transition-colors rounded-t-xl"
                  onClick={() => setShowCategoriesFilter(!showCategoriesFilter)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <Package size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Danh mục</h4>
                      <p className="text-xs text-gray-500">
                        {visibleCategories.length} danh mục
                      </p>
                    </div>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform duration-150 ${showCategoriesFilter ? 'rotate-180' : ''}`}
                  />
                </div>
                
                {showCategoriesFilter && (
                  <div className="p-4 pt-0">
                    {isCategoriesLoading ? (
                      <div className="py-4 flex justify-center">
                        <Spin size="small" />
                      </div>
                    ) : (
                      <ul className="space-y-2 max-h-64 overflow-y-auto">
                        {visibleCategories.map((category) => (
                          <FilterItem
                            key={category.id}
                            item={category}
                            isSelected={selectedCategoryId === category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            type="category"
                            isLoading={loadingFilterId === category.id && loadingFilterType === 'category'}
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Brands */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div
                  className="flex justify-between items-center cursor-pointer p-4 hover:bg-gray-50 transition-colors rounded-t-xl"
                  onClick={() => setShowBrandsFilter(!showBrandsFilter)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                      <TagIcon size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Thương hiệu</h4>
                      <p className="text-xs text-gray-500">
                        {visibleBrands.length} thương hiệu
                      </p>
                    </div>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform duration-150 ${showBrandsFilter ? 'rotate-180' : ''}`}
                  />
                </div>
                
                {showBrandsFilter && (
                  <div className="p-4 pt-0">
                    {isBrandsLoading ? (
                      <div className="py-4 flex justify-center">
                        <Spin size="small" />
                      </div>
                    ) : (
                      <ul className="space-y-2 max-h-64 overflow-y-auto">
                        {visibleBrands.map((brand) => (
                          <FilterItem
                            key={brand.id}
                            item={brand}
                            isSelected={selectedBrandId === brand.id}
                            onClick={() => handleBrandClick(brand.id)}
                            type="brand"
                            isLoading={loadingFilterId === brand.id && loadingFilterType === 'brand'}
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all active:scale-95"
          >
            <Filter size={20} />
          </button>

          {/* Mobile Filters Modal */}
          {showMobileFilters && (
            <>
              <div
                className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="lg:hidden fixed right-0 top-0 bottom-0 z-[9999] w-80 bg-white shadow-xl animate-slideInRight">
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                  <div className="flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                      <Filter size={20} />
                      <h3 className="text-lg font-bold">Bộ lọc</h3>
                    </div>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="text-white hover:bg-white/20 w-8 h-8 flex items-center justify-center rounded transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {/* Categories */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div
                        className="flex justify-between items-center cursor-pointer p-4"
                        onClick={() => setShowCategoriesFilter(!showCategoriesFilter)}
                      >
                        <span className="font-medium text-gray-800">Danh mục</span>
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform ${showCategoriesFilter ? 'rotate-180' : ''}`}
                        />
                      </div>
                      {showCategoriesFilter && (
                        <div className="p-2">
                          <ul className="space-y-1">
                            {visibleCategories.map((category) => (
                              <FilterItem
                                key={category.id}
                                item={category}
                                isSelected={selectedCategoryId === category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                type="category"
                                isLoading={loadingFilterId === category.id && loadingFilterType === 'category'}
                              />
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Brands */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div
                        className="flex justify-between items-center cursor-pointer p-4"
                        onClick={() => setShowBrandsFilter(!showBrandsFilter)}
                      >
                        <span className="font-medium text-gray-800">Thương hiệu</span>
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform ${showBrandsFilter ? 'rotate-180' : ''}`}
                        />
                      </div>
                      {showBrandsFilter && (
                        <div className="p-2">
                          <ul className="space-y-1">
                            {visibleBrands.map((brand) => (
                              <FilterItem
                                key={brand.id}
                                item={brand}
                                isSelected={selectedBrandId === brand.id}
                                onClick={() => handleBrandClick(brand.id)}
                                type="brand"
                                isLoading={loadingFilterId === brand.id && loadingFilterType === 'brand'}
                              />
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {/* Header with Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {getCurrentParams().search ? (
                      <>
                        Kết quả tìm kiếm:{" "}
                        <span className="text-blue-600">"{getCurrentParams().search}"</span>
                      </>
                    ) : selectedCategory ? (
                      selectedCategory.name
                    ) : (
                      "Tất cả sản phẩm"
                    )}
                    {currentPage > 1 && (
                      <span className="text-lg text-gray-500 ml-2">
                        (Trang {currentPage})
                      </span>
                    )}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <TrendingUp size={14} />
                      {totalProducts} sản phẩm
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>
                      Trang {currentPage} / {totalPages}
                    </span>
                    {showFeatured && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <span className="text-yellow-500">●</span>
                        {products.filter(p => p.isFeatured).length} nổi bật
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* ✅ SỬA CHECKBOX ĐỂ DÙNG HÀM RIÊNG */}
                  <Checkbox
                    checked={showFeatured}
                    onChange={(e) => handleFeaturedChange(e.target.checked)}
                    className="!items-center"
                    disabled={pendingPromoted}
                  >
                    <span className="font-medium">Nổi bật</span>
                  </Checkbox>

                  <Checkbox
                    checked={showPromoted}
                    onChange={(e) => handlePromotedChange(e.target.checked)}
                    className="!items-center"
                  >
                    <span className="font-medium">Khuyến mãi</span>
                  </Checkbox>

                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    options={sortOptions}
                    className="min-w-[180px]"
                    size="middle"
                    suffixIcon={<ChevronDown size={14} />}
                    dropdownStyle={{
                      borderRadius: '12px',
                      padding: '8px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {products.length > 0 ? (
              <div className="relative">
                <div className={`transition-opacity duration-150 ${isGridRefreshing ? 'opacity-80' : 'opacity-100'}`}>
                  {/* ✅ THÊM DEBUG INFO */}
                  {showPromoted && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700 flex items-center gap-2">
                        <span className="font-semibold">Đang hiển thị sản phẩm khuyến mãi:</span>
                        {products.length} sản phẩm
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product, index) => {
                      const globalIndex = (currentPage - 1) * PRODUCTS_PER_PAGE + index;

                      // ✅ DÙNG DIRECT COMPONENTS KHÔNG CÓ SUSPENSE
                      if (product.promotionProducts && product.promotionProducts.length > 0) {
                        return (
                          <div 
                            key={`${product.id}-${currentPage}`} 
                            className="transform transition-transform duration-150 hover:-translate-y-0.5"
                            style={{
                              willChange: 'transform',
                              backfaceVisibility: 'hidden',
                            }}
                          >
                            <ProductCardPromoted
                              product={product}
                              index={globalIndex}
                            />
                          </div>
                        );
                      } else if (product.isFeatured) {
                        return (
                          <div 
                            key={`${product.id}-${currentPage}`} 
                            className="transform transition-transform duration-150 hover:-translate-y-0.5"
                            style={{
                              willChange: 'transform',
                              backfaceVisibility: 'hidden',
                            }}
                          >
                            <ProductCardFeatured
                              product={product}
                              index={globalIndex}
                            />
                          </div>
                        );
                      } else {
                        return (
                          <div 
                            key={`${product.id}-${currentPage}`} 
                            className="transform transition-transform duration-150 hover:-translate-y-0.5"
                            style={{
                              willChange: 'transform',
                              backfaceVisibility: 'hidden',
                            }}
                          >
                            <ProductCard
                              product={product}
                              index={globalIndex}
                            />
                          </div>
                        );
                      }
                    })}
                  </div>

                  {/* ✅ XÓA INFINITE SCROLL LOADER */}
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex justify-center">
                  <div className="flex flex-col justify-center items-center bg-gradient-to-b from-white to-gray-50 rounded-2xl p-8 border border-gray-200 text-center w-full max-w-lg">
                    <div className="mb-6">
                      <div className="w-40 h-40 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                        <Search size={64} className="text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {showPromoted ? "Không có sản phẩm khuyến mãi" : "Không tìm thấy sản phẩm"}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md">
                      {showPromoted
                        ? "Hiện tại không có sản phẩm nào đang khuyến mãi. Vui lòng thử lại sau hoặc xem các sản phẩm khác."
                        : getCurrentParams().search
                        ? `Không có sản phẩm nào phù hợp với tìm kiếm "${getCurrentParams().search}"`
                        : "Không có sản phẩm nào phù hợp với bộ lọc hiện tại"}
                    </p>
                    <Button
                      type="primary"
                      size="large"
                      onClick={resetFilters}
                      className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !border-0 hover:!from-blue-700 hover:!to-purple-700 shadow-lg"
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination - CHỈ HIỆN KHI CÓ NHIỀU TRANG */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <Pagination
                    current={currentPage}
                    total={totalProducts}
                    pageSize={PRODUCTS_PER_PAGE}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showLessItems
                    showQuickJumper
                    className="[&_.ant-pagination-item]:rounded-lg [&_.ant-pagination-item]:border-gray-300 [&_.ant-pagination-item-active]:bg-gradient-to-r [&_.ant-pagination-item-active]:from-blue-600 [&_.ant-pagination-item-active]:to-purple-600 [&_.ant-pagination-item-active]:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}