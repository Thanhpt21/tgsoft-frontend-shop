"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Award, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useAllBrands } from "@/hooks/brand/useAllBrands";
import { motion } from "framer-motion";

interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  thumb: string;
  productCount?: number;
}

// ✅ Brand Card Component - Tối ưu mobile
const BrandCard = ({ brand, index }: { brand: Brand; index: number }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="snap-center flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-12px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-12px)] xl:w-[calc(16.666%-12px)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.3,
          delay: index * 0.05 
        }}
        whileHover={{ 
          scale: 1.03,
          transition: { duration: 0.2 }
        }}
        className="h-full"
      >
        <div className="group cursor-pointer h-full bg-white rounded-xl md:rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg md:hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="relative p-4 md:p-6 flex flex-col items-center justify-center h-full min-h-[140px] md:min-h-[180px]">
            {!isLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse" />
              </div>
            )}

            <div className="relative w-16 h-16 md:w-24 md:h-24 mb-3 md:mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur opacity-40 md:opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative w-full h-full flex items-center justify-center">
                {imageError ? (
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                  </div>
                ) : (
                  <img
                    src={brand.thumb}
                    alt={brand.name}
                    className={`w-full h-full object-contain transition-all duration-300 ${
                      isLoaded ? 'opacity-100' : 'opacity-0'
                    } group-hover:scale-105`}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setImageError(true)}
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                )}
              </div>
            </div>

            <div className="text-center w-full">
              <h3 className="font-bold text-gray-900 text-sm md:text-lg mb-1 line-clamp-1 group-hover:text-blue-700 transition-colors duration-300">
                {brand.name}
              </h3>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ✅ Loading Skeleton - Horizontal
const BrandCardSkeleton = () => (
  <>
    {[...Array(6)].map((_, index) => (
      <div key={index} className="snap-center flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-12px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-12px)] xl:w-[calc(16.666%-12px)]">
        <div className="h-full bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6">
          <div className="animate-pulse">
            <div className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mb-3 md:mb-4" />
            <div className="space-y-2 md:space-y-3">
              <div className="h-3 md:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mx-auto" />
              <div className="h-2 md:h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </>
);

// ✅ Main Component - Horizontal scroll
function BrandList() {
  const { data: brands, isLoading, isError } = useAllBrands();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position
  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Scroll handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollContainerRef.current.clientWidth * 0.8,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollContainerRef.current.clientWidth * 0.8,
        behavior: 'smooth'
      });
    }
  };

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      scrollRight();
    } else if (touchEnd - touchStart > 50) {
      // Swipe right
      scrollLeft();
    }
  };

  // Check scroll position on mount and resize
  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollPosition);
      }
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [checkScrollPosition]);

  // Error or empty state
  if (isError || (!isLoading && (!brands || brands.length === 0))) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="text-center py-8 md:py-12">
            <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Award className="text-gray-400 w-8 h-8 md:w-12 md:h-12" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
              Chưa có thương hiệu
            </h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base">
              Các thương hiệu sẽ được cập nhật sớm nhất
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="flex items-center justify-center gap-1 md:gap-2 mb-3 md:mb-4">
            <div className="w-6 h-[1px] md:w-8 md:h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
            <div className="w-6 h-[1px] md:w-8 md:h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          </div>

          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Đối tác & Thương hiệu
            </span>
          </h2>
          
          <div className="relative inline-block mb-4 md:mb-6">
            <div className="w-20 h-1 md:w-32 md:h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto" />
            <div className="absolute inset-0 w-20 h-1 md:w-32 md:h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto blur opacity-30" />
          </div>
          
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-lg">
            Hợp tác với những thương hiệu hàng đầu, mang đến sản phẩm chất lượng cao
          </p>
        </motion.div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          {/* Navigation Buttons - Desktop only */}
          {!isLoading && brands && brands.length > 0 && (
            <>
              <button
                onClick={scrollLeft}
                className={`absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all duration-300 hover:scale-110 hidden md:flex ${
                  !canScrollLeft && 'opacity-0 cursor-default'
                }`}
                aria-label="Scroll left"
                disabled={!canScrollLeft}
              >
                <ChevronLeft size={16} className="md:size-20" />
              </button>
              <button
                onClick={scrollRight}
                className={`absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all duration-300 hover:scale-110 hidden md:flex ${
                  !canScrollRight && 'opacity-0 cursor-default'
                }`}
                aria-label="Scroll right"
                disabled={!canScrollRight}
              >
                <ChevronRight size={16} className="md:size-20" />
              </button>
            </>
          )}

          {/* Scroll Container */}
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto scrollbar-hide gap-4 py-2 px-1 snap-x snap-mandatory"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>

              {isLoading ? (
                <div className="flex gap-4">
                  <BrandCardSkeleton />
                </div>
              ) : (
                brands?.map((brand: Brand, index: number) => (
                  <BrandCard key={brand.id} brand={brand} index={index} />
                ))
              )}
              
              {/* Extra padding for better scroll */}
              <div className="flex-shrink-0 w-4" />
            </div>

            {/* Scroll indicator - Mobile only */}
            <div className="flex justify-center gap-1.5 mt-4 md:hidden">
              {!isLoading && brands && Array.from({ length: Math.ceil(brands.length / 2) }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gray-200"
                />
              ))}
            </div>
          </div>

          {/* Mobile hint */}
          <div className="mt-3 text-center text-xs text-gray-400 md:hidden">
            Kéo sang trái/phải để xem thêm
          </div>
        </div>
      </div>
    </section>
  );
}

export default BrandList;