"use client";

import { useState, useRef, useEffect, useCallback, useMemo, Suspense } from "react";
import { usePromotedProducts } from "@/hooks/product/usePromotedProducts";
import { Product } from "@/types/product.type";
import { ChevronLeft, ChevronRight, Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';

// Lazy load ProductCardPromoted với skeleton
const LazyProductCardPromoted = dynamic(
  () => import("../product/ProductCardPromoted"),
  {
    loading: () => <ProductCardSkeleton />,
    ssr: false
  }
);

// Skeleton component cho loading
const ProductCardSkeleton = () => (
  <div className="animate-pulse h-full">
    <div className="bg-gray-200 rounded-lg aspect-square mb-3"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

const CountdownTimer = () => {
  const [time, setTime] = useState({ hours: 2, minutes: 59, seconds: 45 });
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 2;
              minutes = 59;
              seconds = 45;
            }
          }
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, '0');
  
  return (
    <div className="flex items-center gap-1">
      <div className="bg-black text-white text-xs font-bold px-1.5 py-1 rounded min-w-[26px] text-center">
        {formatTime(time.hours)}
      </div>
      <span className="font-bold text-gray-900">:</span>
      <div className="bg-black text-white text-xs font-bold px-1.5 py-1 rounded min-w-[26px] text-center">
        {formatTime(time.minutes)}
      </div>
      <span className="font-bold text-gray-900">:</span>
      <div className="bg-black text-white text-xs font-bold px-1.5 py-1 rounded min-w-[26px] text-center">
        {formatTime(time.seconds)}
      </div>
    </div>
  );
};

export default function FlashDeals() {
  const [page] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: productsResponse, isLoading } = usePromotedProducts({ 
    page, 
    limit: 12 
  });

  const products = useMemo(() => {
    return ((productsResponse?.data as Product[]) || []).filter((p) => p.isPublished);
  }, [productsResponse]);

  // Mobile: luôn hiện 2 card, Desktop: responsive
  const [itemsPerSlide, setItemsPerSlide] = useState(2); // Mặc định 2 cho mobile
  
  // Tính toán responsive items per slide - ƯU TIÊN MOBILE 2 CARD
  const calculateItemsPerSlide = useCallback(() => {
    if (typeof window === 'undefined') return 2;
    
    const width = window.innerWidth;
    if (width < 480) return 2; // Mobile: luôn 2 card
    if (width < 640) return 2; // Small mobile: 2 card
    if (width < 768) return 3; // Tablet nhỏ: 3 card
    if (width < 1024) return 4; // Tablet lớn: 4 card
    return 5; // Desktop: 5 card
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(calculateItemsPerSlide());
    };

    handleResize();
    
    const debouncedResize = () => {
      clearTimeout((window as any).resizeTimer);
      (window as any).resizeTimer = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout((window as any).resizeTimer);
    };
  }, [calculateItemsPerSlide]);

  // Auto play slider
  useEffect(() => {
    if (!isAutoPlaying || products.length === 0) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % totalSlides);
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, products.length, itemsPerSlide]);

  const totalSlides = Math.ceil(products.length / itemsPerSlide);
  const startIndex = currentIndex * itemsPerSlide;
  const endIndex = Math.min(startIndex + itemsPerSlide, products.length);
  
  // Sản phẩm hiển thị hiện tại
  const currentProducts = products.slice(startIndex, endIndex);
  
  // Đảm bảo luôn có đủ items (fill với empty items nếu cần)
  const displayProducts = [...currentProducts];
  while (displayProducts.length < itemsPerSlide && products.length > 0) {
    const fillIndex = (startIndex + displayProducts.length) % products.length;
    displayProducts.push(products[fillIndex]);
  }

  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev + 1) % totalSlides);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  }, [totalSlides]);

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 30; // Giảm khoảng cách swipe cho mobile

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  if (isLoading) {
    return (
      <section className="py-6 bg-white border-b border-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="text-red-600 w-5 h-5 fill-current" />
                Flash Sale
              </h2>
              <CountdownTimer />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section 
      className="py-6 bg-white border-b border-gray-50"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="text-red-600 w-5 h-5 fill-current animate-pulse" />
              <span className="text-sm md:text-base uppercase">Flash Sale</span>
            </h2>
            <div className="text-xs md:text-sm">
              <CountdownTimer />
            </div>
          </div>
          <Link 
            href="/san-pham" 
            className="text-xs font-semibold text-gray-500 hover:text-black transition-colors duration-200 group flex items-center gap-1"
            prefetch={true}
          >
            <span className="hidden sm:inline">Xem tất cả</span>
            <span className="sm:hidden">Tất cả</span>
            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Slider Content */}
        <div className="relative">
          {/* Navigation Buttons - chỉ hiện trên desktop */}
          {totalSlides > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all duration-300 hover:scale-110 hidden md:flex"
                aria-label="Previous slide"
              >
                <ChevronLeft size={16} className="md:size-20" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all duration-300 hover:scale-110 hidden md:flex"
                aria-label="Next slide"
              >
                <ChevronRight size={16} className="md:size-20" />
              </button>
            </>
          )}

          {/* Product Grid - Luôn grid-cols-2 cho mobile */}
          <div className={`grid ${itemsPerSlide === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'} gap-3`}>
            {displayProducts.map((product, index) => (
              <div 
                key={`${product.id}-${currentIndex}-${index}`}
                className="h-full animate-fade-in-up"
              >
                <Suspense fallback={<ProductCardSkeleton />}>
                  <LazyProductCardPromoted 
                    product={product} 
                    index={index}
                  />
                </Suspense>
              </div>
            ))}
          </div>

          {/* Progress bar cho auto play */}
          {isAutoPlaying && totalSlides > 1 && (
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gray-100 overflow-hidden rounded-full">
              <div 
                className="h-full bg-red-600 transition-all duration-5000 ease-linear"
                style={{ 
                  animation: 'progress 5s linear forwards',
                  animationPlayState: 'running'
                }}
              />
            </div>
          )}

          {/* Indicators - responsive */}
          {/* {totalSlides > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(i);
                    setTimeout(() => setIsAutoPlaying(true), 3000);
                  }}
                  className={`
                    transition-all duration-300 rounded-full focus:outline-none
                    ${i === currentIndex 
                      ? "w-6 h-1.5 bg-red-600" 
                      : "w-1.5 h-1.5 bg-gray-200 hover:bg-gray-300"
                    }
                  `}
                  aria-label={`Flash deal page ${i + 1}`}
                  aria-current={i === currentIndex ? 'page' : undefined}
                />
              ))}
            </div>
          )} */}
        </div>

        {/* Mobile touch hint - chỉ hiện trên mobile */}
        <div className="mt-3 text-center text-xs text-gray-400 md:hidden">
          Kéo sang trái/phải để xem thêm
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }

        /* Mobile specific styles */
        @media (max-width: 480px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          /* Ensure 2 cards fit perfectly on mobile */
          .grid-cols-2 > * {
            min-width: calc(50% - 0.375rem);
          }
        }
      `}</style>
    </section>
  );
}