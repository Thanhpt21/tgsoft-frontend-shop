"use client";

import { useState, useRef, useEffect, useCallback, useMemo, Suspense } from "react";
import { usePromotedProducts } from "@/hooks/product/usePromotedProducts";
import { Product } from "@/types/product.type";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';

// Lazy load ProductCardPromoted
const LazyProductCardPromoted = dynamic(
  () => import("../product/ProductCardPromoted"),
  {
    loading: () => <ProductCardSkeleton />,
    ssr: false
  }
);

// Skeleton
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
        
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: productsResponse, isLoading } = usePromotedProducts({ 
    page: 1, 
    limit: 12 
  });

  const products = useMemo(() => {
    return ((productsResponse?.data as Product[]) || []).filter((p) => p.isPublished);
  }, [productsResponse]);

  // Responsive items per slide
  const [itemsPerSlide, setItemsPerSlide] = useState(2);
  
  const calculateItemsPerSlide = useCallback(() => {
    if (typeof window === 'undefined') return 2;
    const width = window.innerWidth;
    if (width < 480) return 2;
    if (width < 640) return 2;
    if (width < 768) return 3;
    if (width < 1024) return 4;
    return 5;
  }, []);

  useEffect(() => {
    const handleResize = () => setItemsPerSlide(calculateItemsPerSlide());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateItemsPerSlide]);

  // Tính tổng số slide - không fill thừa
  const totalSlides = Math.ceil(products.length / itemsPerSlide);

  // Auto play
  useEffect(() => {
    if (!isAutoPlaying || totalSlides <= 1 || products.length === 0) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % totalSlides);
    }, 5000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, totalSlides, products.length]);

  const nextSlide = () => {
    if (totalSlides <= 1) return;
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev + 1) % totalSlides);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const prevSlide = () => {
    if (totalSlides <= 1) return;
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  // Touch swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 30;

  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextSlide();
    else if (distance < -minSwipeDistance) prevSlide();
  };

  // Lấy sản phẩm hiện tại - KHÔNG FILL THỪA
  const startIndex = currentIndex * itemsPerSlide;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerSlide);

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
          >
            <span className="hidden sm:inline">Xem tất cả</span>
            <span className="sm:hidden">Tất cả</span>
            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Slider */}
        <div className="relative">
          {/* Navigation Buttons - desktop only */}
          {totalSlides > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all duration-300 hover:scale-110 hidden md:flex"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all duration-300 hover:scale-110 hidden md:flex"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Product Grid */}
          <div className={`grid grid-cols-2 ${itemsPerSlide > 2 ? 'md:grid-cols-3 lg:grid-cols-5' : ''} gap-3`}>
            {currentProducts.map((product, idx) => (
              <div key={`${product.id}-${currentIndex}-${idx}`} className="h-full">
                <Suspense fallback={<ProductCardSkeleton />}>
                  <LazyProductCardPromoted product={product} index={idx} />
                </Suspense>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile hint */}
        <div className="mt-3 text-center text-xs text-gray-400 md:hidden">
          Kéo sang trái/phải để xem thêm
        </div>
      </div>
    </section>
  );
}