"use client";

import { useState, useRef, useEffect } from "react";
import { usePromotedProducts } from "@/hooks/product/usePromotedProducts";
import { Product } from "@/types/product.type";
import { ChevronLeft, ChevronRight, Zap, ArrowRight } from "lucide-react";
import ProductCardPromoted from "../product/ProductCardPromoted";
import Link from "next/link";

// Component con: Đồng hồ đếm ngược tối giản
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (val: number) => val.toString().padStart(2, "0");

  // Style số đơn giản, sang trọng hơn (đen trên trắng hoặc xám)
  const boxClass = "bg-gray-900 text-white rounded text-sm font-semibold px-2 py-1 min-w-[32px] text-center";

  return (
    <div className="flex items-center gap-1">
      <div className={boxClass}>{formatTime(timeLeft.hours)}</div>
      <span className="text-gray-900 font-bold">:</span>
      <div className={boxClass}>{formatTime(timeLeft.minutes)}</div>
      <span className="text-gray-900 font-bold">:</span>
      <div className={boxClass}>{formatTime(timeLeft.seconds)}</div>
    </div>
  );
};

export default function FlashDeals() {
  const PRODUCTS_LIMIT = 12;
  const [page] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerSlide, setItemsPerSlide] = useState(5);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const { data: productsResponse, isLoading, isError } = usePromotedProducts({
    page,
    limit: PRODUCTS_LIMIT,
  });

  const products = ((productsResponse?.data as Product[]) || []).filter(
    (p) => p.isPublished
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerSlide(2);
      else if (window.innerWidth < 768) setItemsPerSlide(3);
      else if (window.innerWidth < 1024) setItemsPerSlide(4);
      else setItemsPerSlide(5);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.ceil(products.length / itemsPerSlide);

  const startAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  useEffect(() => {
    if (!isPaused && totalSlides > 1) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return () => stopAutoPlay();
  }, [isPaused, totalSlides]);

  const handlePrev = () => {
    stopAutoPlay();
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    stopAutoPlay();
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const getCurrentProducts = () => {
    const start = currentIndex * itemsPerSlide;
    return products.slice(start, start + itemsPerSlide);
  };

  if (isLoading) return <div className="h-96 bg-gray-50 animate-pulse"></div>;
  if (isError || products.length === 0) return null;

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section - Clean & Modern */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase tracking-tight">
                Flash Deals
              </h2>
              <Zap className="w-6 h-6 text-red-600 fill-current" />
            </div>
            
            {/* Timer Wrapper */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Kết thúc trong</span>
              <CountdownTimer />
            </div>
          </div>

          <Link href="/san-pham" className="group flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">
            Xem tất cả
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Slider Container */}
        <div 
          className="relative group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Buttons - Minimalist */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-gray-700 shadow-lg rounded-full hover:bg-gray-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-gray-700 shadow-lg rounded-full hover:bg-gray-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {getCurrentProducts().map((product, index) => (
              <div
                key={product.id}
                className="h-full"
              >
                 <ProductCardPromoted product={product} index={index} />
              </div>
            ))}
          </div>

          {/* Indicators - Simple dots */}
          {totalSlides > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    stopAutoPlay();
                    setCurrentIndex(i);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? "w-6 bg-red-600"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}