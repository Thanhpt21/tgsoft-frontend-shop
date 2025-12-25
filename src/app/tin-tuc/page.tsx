'use client';

import React, { useMemo, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Spin, Empty, Button, Pagination, Select, Input } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined, CalendarOutlined, FireOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';

import { useAllBlogs } from '@/hooks/blog/useAllBlogs';

import { Blog } from '@/types/blog.type';

// ✅ Lazy load BlogCard với Suspense
const BlogCard = React.lazy(() => import('@/components/layout/blog/BlogCard'));

// ✅ Loading Skeleton Component
const BlogCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
    <div className="relative">
      <div className="aspect-video bg-gradient-to-r from-gray-200 to-gray-300" />
    </div>
    <div className="p-6">
      <div className="space-y-3">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4" />
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2" />
        <div className="h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded" />
        <div className="flex items-center justify-between pt-4">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20" />
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-200 to-gray-300" />
        </div>
      </div>
    </div>
  </div>
);

// ✅ Filter Badge Component
const FilterBadge = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
    {label}
    <button
      onClick={onRemove}
      className="ml-1 text-blue-500 hover:text-blue-700 transition-colors"
      aria-label={`Remove ${label} filter`}
    >
      ×
    </button>
  </span>
);

// ✅ Main Component
export default function NewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ Parse URL params
  const urlParams = useMemo(() => ({
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
  }), [searchParams]);

  const [localSearch, setLocalSearch] = useState(urlParams.search);
  const [sortBy, setSortBy] = useState(urlParams.sortBy);
  const [currentPage, setCurrentPage] = useState(urlParams.page);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const BLOGS_PER_PAGE = 12;

  // ✅ Fetch all blogs
  const { data: blogs, isLoading, isError, refetch } = useAllBlogs();

  // ✅ Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== urlParams.search) {
        updateUrlParams({ search: localSearch, page: 1 });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [localSearch]);

  // ✅ Update URL params
  const updateUrlParams = (updates: Partial<typeof urlParams>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    router.replace(`/tin-tuc?${params.toString()}`, { scroll: false });
  };

  // ✅ Filter và sort blogs
  const processedBlogs = useMemo(() => {
    if (!blogs) return [];

    let filtered = blogs.filter((blog: Blog) => blog.isPublished);

    // Filter by search
    if (urlParams.search) {
      const searchTerm = urlParams.search.toLowerCase();
      filtered = filtered.filter((blog: Blog) =>
        blog.title?.toLowerCase().includes(searchTerm) ||
        blog.content?.toLowerCase().includes(searchTerm) ||
        blog.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Sort blogs
    switch (urlParams.sortBy) {
      case 'newest':
        filtered.sort((a: Blog, b: Blog) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'oldest':
        filtered.sort((a: Blog, b: Blog) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'popular':
        filtered.sort((a: Blog, b: Blog) => (b.numberViews || 0) - (a.numberViews || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [blogs, urlParams.search, urlParams.sortBy]);

  // ✅ Pagination
  const totalBlogs = processedBlogs.length;
  const totalPages = Math.ceil(totalBlogs / BLOGS_PER_PAGE);
  const paginatedBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * BLOGS_PER_PAGE;
    return processedBlogs.slice(startIndex, startIndex + BLOGS_PER_PAGE);
  }, [processedBlogs, currentPage]);

  // ✅ Reset filters
  const resetFilters = () => {
    setLocalSearch('');
    setSortBy('newest');
    setCurrentPage(1);
    router.replace('/tin-tuc', { scroll: false });
  };

  // ✅ Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ Check if filters are active
  const isFilterActive = urlParams.search;

  // ✅ Loading state
  if (isLoading && !blogs) {
    return (
      <div className="min-h-screen">
        <BreadcrumbSkeleton />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-0 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-64 mb-4"></div>
            <div className="flex flex-wrap gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-32"></div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <BlogCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (isError) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-0 py-8">
          <Breadcrumb />
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mb-6">
              <div className="text-4xl">⚠️</div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Đã xảy ra lỗi</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Không thể tải danh sách tin tức. Vui lòng kiểm tra kết nối mạng và thử lại.
            </p>
            <Button
              type="primary"
              size="large"
              onClick={() => refetch()}
              className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !border-0 hover:!from-blue-700 hover:!to-purple-700"
              icon={<ReloadOutlined />}
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <Breadcrumb />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-0 py-8">




        {/* Blog Grid */}
        {paginatedBlogs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
              <SearchOutlined className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Không tìm thấy bài viết
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {urlParams.search
                ? `Không có bài viết nào phù hợp với "${urlParams.search}". Vui lòng thử từ khóa khác.`
                : 'Hiện chưa có bài viết nào được đăng. Vui lòng quay lại sau.'}
            </p>
            {isFilterActive && (
              <Button
                type="primary"
                size="large"
                onClick={resetFilters}
                className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !border-0"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              <Suspense fallback={
                <>
                  {[...Array(8)].map((_, index) => (
                    <BlogCardSkeleton key={index} />
                  ))}
                </>
              }>
                {paginatedBlogs.map((blog: Blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </Suspense>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <Pagination
                    current={currentPage}
                    total={totalBlogs}
                    pageSize={BLOGS_PER_PAGE}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper
                    className="custom-pagination"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="md:hidden fixed right-0 top-0 bottom-0 z-[9999] w-80 bg-white shadow-xl animate-slideInRight">
            <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 p-4">
              <div className="flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <FilterOutlined />
                  <h3 className="text-lg font-bold">Bộ lọc</h3>
                </div>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-white hover:bg-white/20 w-8 h-8 flex items-center justify-center rounded transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm kiếm
                  </label>
                  <Input
                    placeholder="Tìm kiếm tin tức..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sắp xếp
                  </label>
                  <Select
                    value={sortBy}
                    onChange={(value) => {
                      setSortBy(value);
                      updateUrlParams({ sortBy: value });
                    }}
                    options={[
                      { label: 'Mới nhất', value: 'newest' },
                      { label: 'Cũ nhất', value: 'oldest' },
                      { label: 'Xem nhiều nhất', value: 'popular' },
                    ]}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        .custom-pagination .ant-pagination-item {
          border-radius: 8px !important;
          border: 2px solid #e5e7eb !important;
          font-weight: 600 !important;
        }
        
        .custom-pagination .ant-pagination-item-active {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
          border-color: transparent !important;
        }
        
        .custom-pagination .ant-pagination-item-active a {
          color: white !important;
        }
        
        .custom-pagination .ant-pagination-item:hover {
          border-color: #3b82f6 !important;
        }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

// ✅ Breadcrumb Component
const Breadcrumb = () => (
  <div className="">
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-0 py-3">
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Trang chủ
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">Tin tức</span>
      </div>
    </div>
  </div>
);

// ✅ Breadcrumb Skeleton
const BreadcrumbSkeleton = () => (
  <div className="">
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-0 py-3">
      <div className="flex items-center gap-2 text-sm">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-4"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
      </div>
    </div>
  </div>
);