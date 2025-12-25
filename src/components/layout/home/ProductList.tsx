"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNonPromotedProducts } from "@/hooks/product/useNonPromotedProducts";
import { Product } from "@/types/product.type";
import ProductCardFeatured from "../product/ProductCardFeatured";
import { 
  Sparkles, 
  Loader2, 
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Star,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

// Skeleton loading component
const ProductCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
  >
    <div className="animate-pulse">
      <div className="aspect-square bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-8"></div>
        </div>
      </div>
    </div>
  </motion.div>
);

// Product card for slider
const ProductSlideCard = ({ 
  product, 
  index,
  slideIndex
}: { 
  product: Product; 
  index: number;
  slideIndex: number;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, index * 30);
    return () => clearTimeout(timer);
  }, [index]);

  if (!isLoaded) {
    return <ProductCardSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
      }}
      whileHover={{ 
        y: -8,
        scale: 1.03,
        transition: { duration: 0.2 }
      }}
      className="h-full px-2"
    >
      <ProductCardFeatured product={product} index={index} />
    </motion.div>
  );
};

// Slider dots navigation
// const SliderDots = ({ 
//   total, 
//   current, 
//   onClick 
// }: { 
//   total: number; 
//   current: number; 
//   onClick: (index: number) => void; 
// }) => {
//   if (total <= 1) return null;

//   return (
//     <div className="flex items-center justify-center gap-2 mt-8">
//       {Array.from({ length: total }).map((_, index) => (
//         <button
//           key={index}
//           onClick={() => onClick(index)}
//           className={`transition-all duration-300 ${
//             current === index
//               ? 'w-8 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full'
//               : 'w-2 h-2 bg-gray-300 hover:bg-gray-400 rounded-full hover:scale-125'
//           }`}
//           aria-label={`Go to slide ${index + 1}`}
//         />
//       ))}
//     </div>
//   );
// };

export default function ProductList() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerSlide, setItemsPerSlide] = useState(4);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Fetch products - chỉ fetch 1 lần cho slider
  const { data: productsResponse } = useNonPromotedProducts({
    page: 1,
    limit: 50, // Lấy nhiều sản phẩm cho slider
  });

  const filteredProducts = useMemo(() => {
    const products = ((productsResponse?.data as Product[]) || []).filter(
      (p) => p.isPublished && p.isFeatured
    );
    setIsLoading(false);
    return products;
  }, [productsResponse]);

  // Responsive items per slide
  const updateItemsPerSlide = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const width = window.innerWidth;
    if (width < 640) setItemsPerSlide(2);
    else if (width < 768) setItemsPerSlide(2);
    else if (width < 1024) setItemsPerSlide(3);
    else if (width < 1280) setItemsPerSlide(4);
    else setItemsPerSlide(5);
  }, []);

  useEffect(() => {
    updateItemsPerSlide();
    window.addEventListener('resize', updateItemsPerSlide);
    return () => window.removeEventListener('resize', updateItemsPerSlide);
  }, [updateItemsPerSlide]);

  // Group products for slides
  const groupedProducts = useMemo(() => {
    if (!filteredProducts || filteredProducts.length === 0) return [];
    
    const groups = [];
    const totalGroups = Math.ceil(filteredProducts.length / itemsPerSlide);
    
    for (let i = 0; i < totalGroups; i++) {
      const start = i * itemsPerSlide;
      const group = filteredProducts.slice(start, start + itemsPerSlide);
      groups.push(group);
    }
    
    return groups;
  }, [filteredProducts, itemsPerSlide]);

  const totalSlides = groupedProducts.length;

  // Auto-play slider
  useEffect(() => {
    if (!isPaused && totalSlides > 1) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 5000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, totalSlides]);

  // Navigation handlers
  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Preload images for next slide
  useEffect(() => {
    if (currentSlide < totalSlides - 1) {
      const nextSlideProducts = groupedProducts[currentSlide + 1] || [];
      nextSlideProducts.forEach(product => {
        if (product.thumb) {
          const img = new Image();
          img.src = product.thumb;
        }
      });
    }
  }, [currentSlide, totalSlides, groupedProducts]);

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-0">
          <div className="flex flex-col items-center mb-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="text-blue-600 animate-pulse" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Đang tải sản phẩm
                </span>
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 mx-auto"></div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {[...Array(itemsPerSlide)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!filteredProducts || filteredProducts.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <TrendingUp className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Hiện chưa có sản phẩm nổi bật nào
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Các sản phẩm nổi bật sẽ được cập nhật sớm nhất.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full mb-4 border border-blue-100">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-blue-700">SẢN PHẨM NỔI BẬT</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sản phẩm đặc biệt
            </span>
          </h1>
          
          <div className="relative">
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4 mx-auto"></div>
            <div className="absolute inset-0 w-24 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4 mx-auto blur-md opacity-50"></div>
          </div>
          
          <p className="text-gray-500 max-w-2xl text-lg mb-8">
            Khám phá những sản phẩm xu hướng được lựa chọn đặc biệt dành riêng cho bạn
          </p>

          {/* View all products link */}
          <Link href="/san-pham">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span>Xem tất cả sản phẩm</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Slider container */}
        <div
          ref={sliderRef}
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Slider content */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
              >
                {groupedProducts[currentSlide]?.map((product, index) => (
                  <ProductSlideCard 
                    key={`${product.id}-${currentSlide}`} 
                    product={product} 
                    index={index}
                    slideIndex={currentSlide}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={goToPrevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 rounded-full p-3 hover:bg-white hover:text-blue-600 hover:border-blue-300 hover:shadow-xl transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={goToNextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 rounded-full p-3 hover:bg-white hover:text-blue-600 hover:border-blue-300 hover:shadow-xl transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Slider dots navigation */}
        {/* {totalSlides > 1 && (
          <SliderDots 
            total={totalSlides} 
            current={currentSlide} 
            onClick={goToSlide} 
          />
        )} */}

      
      </div>

      {/* Global styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        /* Responsive grid fix */
        @media (max-width: 640px) {
          .product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 641px) and (max-width: 767px) {
          .product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 768px) and (max-width: 1023px) {
          .product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 1024px) and (max-width: 1279px) {
          .product-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 1280px) {
          .product-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }
      `}</style>
    </section>
  );
}