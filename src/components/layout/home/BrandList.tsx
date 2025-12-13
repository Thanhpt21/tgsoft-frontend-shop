"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Award, Sparkles } from "lucide-react";
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

// ✅ Brand Card Component (đã bỏ badge premium)
const BrandCard = ({ brand, index }: { brand: Brand; index: number }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay: index * 0.05 
      }}
      whileHover={{ 
        y: -8,
        scale: 1.03,
        transition: { duration: 0.3 }
      }}
      className="relative flex-shrink-0 w-full sm:w-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="group cursor-pointer">
        <div className="relative bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

          <div className="relative p-6 flex flex-col items-center justify-center h-full min-h-[180px]">
            {!isLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse" />
              </div>
            )}

            <div className="relative w-24 h-24 mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative w-full h-full flex items-center justify-center">
                {imageError ? (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Award className="w-8 h-8 text-blue-500" />
                  </div>
                ) : (
                  <img
                    src={brand.thumb}
                    alt={brand.name}
                    className={`w-full h-full object-contain transition-all duration-500 ${
                      isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                    } ${isHovered ? 'brightness-110 saturate-125' : 'brightness-95 saturate-90'}`}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setImageError(true)}
                    loading="lazy"
                  />
                )}
              </div>

              {/* Bỏ badge premium hoàn toàn */}
            </div>

            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-blue-700 transition-colors duration-300">
                {brand.name}
              </h3>
            

        
            </div>
          </div>

          <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400/30 rounded-2xl transition-all duration-500 pointer-events-none" />
        </div>

        {/* Giữ connect line animation */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-12 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" />
      </div>
    </motion.div>
  );
};

// ✅ Loading Skeleton (điều chỉnh width skeleton để khớp card)
const BrandCardSkeleton = ({ count = 12 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex-shrink-0 w-[250px] bg-white rounded-2xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mx-auto" />
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 mx-auto" />
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 mx-auto" />
          </div>
        </div>
      </div>
    ))}
  </>
);

// ✅ Main Component - Horizontal Scroll (đã fix kéo ngang không được)
function BrandList() {
  const { data: brands, isLoading, isError } = useAllBrands();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Responsive grid cho skeleton
  const getGridClass = useCallback(() => {
    if (typeof window === 'undefined') return 'grid-cols-2';
    const width = window.innerWidth;
    if (width < 640) return 'grid-cols-2';
    if (width < 768) return 'grid-cols-3';
    if (width < 1024) return 'grid-cols-4';
    if (width < 1280) return 'grid-cols-5';
    return 'grid-cols-6';
  }, []);

  const [gridClass, setGridClass] = useState(getGridClass());

  useEffect(() => {
    const handleResize = () => setGridClass(getGridClass());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getGridClass]);

  // Error or empty state
  if (isError || (!isLoading && (!brands || brands.length === 0))) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Award className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Chưa có thương hiệu
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Các thương hiệu sẽ được cập nhật sớm nhất
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            <Sparkles className="w-5 h-5 text-blue-500" />
            <div className="w-8 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Đối tác & Thương hiệu
            </span>
          </h2>
          
          <div className="relative inline-block mb-6">
            <div className="w-32 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4" />
            <div className="absolute inset-0 w-32 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 blur-md opacity-50" />
          </div>
          
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Hợp tác với những thương hiệu hàng đầu, mang đến sản phẩm chất lượng cao
          </p>
        </motion.div>

        {/* Horizontal Scroll Container - Fix kéo ngang */}
        <div className="relative">
          {isLoading ? (
            <div className={`grid ${gridClass} gap-6`}>
              <BrandCardSkeleton count={12} />
            </div>
          ) : (
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-6 py-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
                }
              `}</style>

              {brands?.map((brand: Brand, index: number) => (
                <div key={brand.id} className="flex-shrink-0 w-[250px] snap-center">
                  <BrandCard brand={brand} index={index} />
                </div>
              ))}
              {/* Padding cuối để dễ kéo */}
              <div className="flex-shrink-0 w-4" />
            </div>
          )}
        </div>

       
      </div>
    </section>
  );
}

export default BrandList;