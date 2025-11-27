"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useAllBrands } from "@/hooks/brand/useAllBrands";

interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  thumb: string;
}

export default function Thuonghieu() {
  const { data: brands, isLoading, isError } = useAllBrands();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const moved = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Số lượng item hiển thị trên mỗi slide
  const getItemsPerSlide = () => {
    if (typeof window === 'undefined') return 6;
    if (window.innerWidth < 640) return 3; // mobile
    if (window.innerWidth < 768) return 4; // sm
    if (window.innerWidth < 1024) return 5; // md
    return 6; // lg+
  };

  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(getItemsPerSlide());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Chia brands thành các nhóm và fill đầy bằng cách lặp lại từ đầu
  const groupedBrands = brands ? 
    Array.from({ length: Math.ceil(brands.length / itemsPerSlide) }, (_, i) => {
      const group = [];
      for (let j = 0; j < itemsPerSlide; j++) {
        const brandIndex = (i * itemsPerSlide + j) % brands.length;
        group.push(brands[brandIndex]);
      }
      return group;
    }) : [];

  const totalSlides = groupedBrands.length;

  // Auto play
  const startAutoPlay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % totalSlides);
    }, 3000);
  };

  const stopAutoPlay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (!paused && !dragging && totalSlides > 1) startAutoPlay();
    else stopAutoPlay();
    return stopAutoPlay;
  }, [paused, dragging, totalSlides]);

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    startX.current = e.clientX;
    moved.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const diff = e.clientX - startX.current;
    if (Math.abs(diff) > 10) moved.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragging) return;
    const diff = e.clientX - startX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setIndex((i) => (i - 1 + totalSlides) % totalSlides);
      else setIndex((i) => (i + 1) % totalSlides);
    }
    setDragging(false);
  };

  // Handle touch
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragging(true);
    startX.current = e.touches[0].clientX;
    moved.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const diff = e.touches[0].clientX - startX.current;
    if (Math.abs(diff) > 10) moved.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragging) return;
    const diff = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setIndex((i) => (i - 1 + totalSlides) % totalSlides);
      else setIndex((i) => (i + 1) % totalSlides);
    }
    setDragging(false);
  };

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-4 border-b-4 border-blue-300 mb-4"></div>
            <p className="text-gray-600 font-medium text-sm sm:text-base">Đang tải thương hiệu...</p>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-12 sm:py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center p-6 sm:p-8 bg-red-50 rounded-2xl sm:rounded-3xl border border-red-100 max-w-md mx-auto">
            <p className="text-red-600 font-semibold text-sm sm:text-base">
              Không thể tải thương hiệu
            </p>
            <p className="text-gray-500 mt-2 text-xs sm:text-sm">Vui lòng thử lại sau</p>
          </div>
        </div>
      </section>
    );
  }

  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>

      {/* Tech Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.015]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="brand-grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="1" fill="currentColor" className="text-blue-600"/>
              <path d="M 0 25 L 50 25 M 25 0 L 25 50" stroke="currentColor" strokeWidth="0.5" className="text-blue-600"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#brand-grid)"/>
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full mb-3 sm:mb-4 backdrop-blur-sm border border-blue-200/50">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Thương hiệu thời trang
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4">
            <span className="text-gray-900">Các thương hiệu</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Uy tín
            </span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Khám phá những thương hiệu thời trang hàng đầu được tin dùng toàn cầu
          </p>
        </div>

        {/* Slider Container */}
        <div
          className="relative w-full overflow-hidden select-none"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slides */}
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {groupedBrands.map((group, groupIndex) => (
              <div key={groupIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                  {group.map((brand: Brand, idx: number) => (
                    <div
                      key={`${brand.id}-${groupIndex}-${idx}`}
                      className="group/card cursor-pointer"
                    >
                      <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 group-hover/card:border-blue-300 group-hover/card:-translate-y-1 md:group-hover/card:-translate-y-2 h-full">
                        {/* Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-0 group-hover/card:opacity-20 transition duration-500"></div>
                        
                        <div className="relative">
                          {/* Image Container */}
                          <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-4 md:p-5 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover/card:from-blue-500/5 group-hover/card:to-purple-500/5 transition-all duration-500"></div>
                            <img
                              src={brand.thumb}
                              alt={brand.name}
                              className="w-full h-full object-contain transform group-hover/card:scale-110 transition-transform duration-500 relative z-10"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder-brand.png";
                              }}
                            />
                          </div>

                          {/* Brand Name */}
                          <div className="p-2 sm:p-2.5 md:p-3 text-center bg-gradient-to-b from-white to-slate-50">
                            <h3 className="font-bold text-[10px] sm:text-xs md:text-sm text-gray-800 group-hover/card:text-blue-600 transition-colors duration-300 truncate">
                              {brand.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={() => {
                  stopAutoPlay();
                  setIndex((i) => (i - 1 + totalSlides) % totalSlides);
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 sm:p-3 hover:scale-110 transition-all z-10 shadow-lg border border-blue-200"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => {
                  stopAutoPlay();
                  setIndex((i) => (i + 1) % totalSlides);
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 sm:p-3 hover:scale-110 transition-all z-10 shadow-lg border border-blue-200"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}

          {/* Indicators */}
          {totalSlides > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {groupedBrands.map((_, i) => (
                <div
                  key={i}
                  onClick={() => {
                    stopAutoPlay();
                    setIndex(i);
                  }}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full cursor-pointer transition-all duration-300 ${
                    i === index ? "bg-blue-600 scale-110" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Brand Count */}
        <div className="text-center mt-8 sm:mt-10">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-blue-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-xs sm:text-sm text-gray-600 font-medium">
              <span className="font-bold text-blue-600">{brands.length}</span> thương hiệu
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}