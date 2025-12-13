"use client";

import { useState, useRef, useEffect, useCallback, useMemo, Suspense } from "react";
import { usePromotedProducts } from "@/hooks/product/usePromotedProducts";
import { Product } from "@/types/product.type";
import { ChevronLeft, ChevronRight, Zap, Loader2 } from "lucide-react";
import ProductCardPromoted from "../product/ProductCardPromoted";
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
              // Reset khi hết thời gian
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
    <div className="flex items-center gap-1 text-xs">
      <div className="bg-black text-white text-xs font-bold px-1.5 py-0.5 rounded min-w-[24px] text-center">
        {formatTime(time.hours)}
      </div>
      <span className="font-bold">:</span>
      <div className="bg-black text-white text-xs font-bold px-1.5 py-0.5 rounded min-w-[24px] text-center">
        {formatTime(time.minutes)}
      </div>
      <span className="font-bold">:</span>
      <div className="bg-black text-white text-xs font-bold px-1.5 py-0.5 rounded min-w-[24px] text-center">
        {formatTime(time.seconds)}
      </div>
    </div>
  );
};

// Debounce function để tránh resize nhiều lần
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Intersection Observer Hook cho lazy loading
const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, {
      rootMargin: '100px', // Load sớm 100px trước khi vào viewport
      threshold: 0.1,
      ...options
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isInView];
};

export default function FlashDeals() {
  const [page] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Intersection Observer cho section
  const [sectionRef, isSectionInView] = useInView({
    threshold: 0.1,
    rootMargin: '200px'
  });

  const { data: productsResponse, isLoading } = usePromotedProducts({ 
    page, 
    limit: 12 
  });

  const products = useMemo(() => {
    return ((productsResponse?.data as Product[]) || []).filter((p) => p.isPublished);
  }, [productsResponse]);

  const [itemsPerSlide, setItemsPerSlide] = useState(5);
  const debouncedItemsPerSlide = useDebounce(itemsPerSlide, 150);

  // Tính toán responsive items per slide
  const calculateItemsPerSlide = useCallback(() => {
    if (typeof window === 'undefined') return 5;
    
    const width = window.innerWidth;
    if (width < 480) return 1;
    if (width < 640) return 2;
    if (width < 768) return 3;
    if (width < 1024) return 4;
    return 5;
  }, []);

  useEffect(() => {
    if (!isSectionInView) return;

    const handleResize = () => {
      const newItemsPerSlide = calculateItemsPerSlide();
      if (newItemsPerSlide !== itemsPerSlide) {
        setItemsPerSlide(newItemsPerSlide);
      }
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
  }, [isSectionInView, calculateItemsPerSlide, itemsPerSlide]);

  // Auto play slider
  useEffect(() => {
    if (!isAutoPlaying || !isSectionInView) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % totalSlides);
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, isSectionInView, products.length, debouncedItemsPerSlide]);

  const totalSlides = Math.ceil(products.length / debouncedItemsPerSlide);
  const startIndex = currentIndex * debouncedItemsPerSlide;
  const endIndex = startIndex + debouncedItemsPerSlide;

  // Lazy load products khi scroll
  useEffect(() => {
    if (!isSectionInView || products.length === 0) return;

    // Chỉ hiển thị products hiện tại và preload một vài products tiếp theo
    const visibleStart = Math.max(0, startIndex - debouncedItemsPerSlide);
    const visibleEnd = Math.min(products.length, endIndex + debouncedItemsPerSlide * 2);
    
    const newVisibleProducts = products.slice(visibleStart, visibleEnd);
    setVisibleProducts(newVisibleProducts);
  }, [isSectionInView, products, startIndex, endIndex, debouncedItemsPerSlide]);

  const nextSlide = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev + 1) % totalSlides);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  }, [totalSlides]);

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

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

  // Prefetch next slide khi hover vào nút
  const prefetchNextSlide = useCallback(() => {
    const nextIndex = (currentIndex + 1) % totalSlides;
    const nextStart = nextIndex * debouncedItemsPerSlide;
    const nextProducts = products.slice(nextStart, nextStart + debouncedItemsPerSlide);
    
    // Preload images
    nextProducts.forEach(product => {
      if (product.thumb) {
        const img = new Image();
        img.src = product.thumb;
      }
    });
  }, [currentIndex, totalSlides, products, debouncedItemsPerSlide]);

  if (isLoading || products.length === 0) {
    return (
      <section ref={sectionRef as any} className="py-8 bg-white border-b border-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2 uppercase">
                <Zap className="text-red-600 w-5 h-5 fill-current" />
                Flash Sale
              </h2>
              <CountdownTimer />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef as any}
      className="py-8 bg-white border-b border-gray-50"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2 uppercase">
              <Zap className="text-red-600 w-5 h-5 fill-current animate-pulse" />
              Flash Sale
            </h2>
            <div className="hidden sm:block">
              <CountdownTimer />
            </div>
          </div>
          <Link 
            href="/san-pham" 
            className="text-xs font-semibold text-gray-500 hover:text-black transition-colors duration-200 group flex items-center gap-1"
            prefetch={true}
          >
            Xem tất cả
            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Slider Content */}
        <div 
          ref={containerRef}
          className="relative group"
        >
          {/* Navigation Buttons */}
          {totalSlides > 1 && (
            <>
              <button 
                onClick={prevSlide}
                onMouseEnter={prefetchNextSlide}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 hidden md:flex"
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextSlide}
                onMouseEnter={prefetchNextSlide}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 hidden md:flex"
                aria-label="Next slide"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.slice(startIndex, endIndex).map((product, index) => (
              <div 
                key={`${product.id}-${currentIndex}`}
                className="h-full transform transition-all duration-500"
                style={{
                  opacity: visibleProducts.includes(product) ? 1 : 0,
                  transform: visibleProducts.includes(product) ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                <Suspense fallback={<ProductCardSkeleton />}>
                  <LazyProductCardPromoted 
                    product={product} 
                    index={index}
                    // priority={index < 2} // Chỉ priority cho 2 sản phẩm đầu tiên
                  />
                </Suspense>
              </div>
            ))}
          </div>

          {/* Loading indicator khi đang load more */}
          {isLoadingMore && (
            <div className="flex justify-center mt-4">
              <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
            </div>
          )}

          {/* Progress bar cho auto play */}
          {isAutoPlaying && totalSlides > 1 && (
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gray-100 overflow-hidden rounded-full">
              <div 
                className="h-full bg-red-600 transition-all duration-5000 ease-linear"
                style={{ 
                  width: '100%',
                  animation: 'progress 5s linear forwards',
                  animationPlayState: 'running'
                }}
              />
            </div>
          )}

          {/* Indicators */}
          {totalSlides > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-6">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(i);
                    setTimeout(() => setIsAutoPlaying(true), 3000);
                  }}
                  className={`
                    transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                    ${i === currentIndex 
                      ? "w-6 h-1.5 bg-red-600" 
                      : "w-1.5 h-1.5 bg-gray-200 hover:bg-gray-300 hover:scale-125"
                    }
                  `}
                  aria-label={`Flash deal page ${i + 1}`}
                  aria-current={i === currentIndex ? 'page' : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile touch hint */}
        <div className="mt-4 text-center text-xs text-gray-400 md:hidden">
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
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Better image loading */
        img {
          content-visibility: auto;
        }
      `}</style>
    </section>
  );
}