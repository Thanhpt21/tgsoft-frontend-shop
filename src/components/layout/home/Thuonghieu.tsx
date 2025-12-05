"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive settings
  const getItemsPerSlide = () => {
    if (typeof window === 'undefined') return 6;
    if (window.innerWidth < 640) return 3;
    if (window.innerWidth < 1024) return 4;
    return 6;
  };

  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());

  useEffect(() => {
    const handleResize = () => setItemsPerSlide(getItemsPerSlide());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Auto play logic (giữ nguyên logic cũ, chỉ clean code)
  useEffect(() => {
    if (!paused && totalSlides > 1) {
        timerRef.current = setInterval(() => {
            setIndex((i) => (i + 1) % totalSlides);
        }, 4000);
    }
    return () => { if(timerRef.current) clearInterval(timerRef.current); };
  }, [paused, totalSlides]);

  if (isLoading || isError || !brands || brands.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Thương hiệu nổi bật</h2>
             {/* Có thể thêm nút xem tất cả ở đây nếu muốn */}
        </div>

        <div
          className="relative w-full overflow-hidden group"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {groupedBrands.map((group, groupIndex) => (
              <div key={groupIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {group.map((brand: Brand, idx: number) => (
                    <div
                      key={`${brand.id}-${groupIndex}-${idx}`}
                      className="group/card cursor-pointer"
                    >
                      <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all duration-300 overflow-hidden h-full flex items-center justify-center p-4 aspect-[4/3]">
                        <img
                          src={brand.thumb}
                          alt={brand.name}
                          className="w-full h-full object-contain filter grayscale group-hover/card:grayscale-0 transition-all duration-300 opacity-80 group-hover/card:opacity-100"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-brand.png"; }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons - Chỉ hiện khi hover vào section */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={() => setIndex((i) => (i - 1 + totalSlides) % totalSlides)}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 text-gray-600 rounded-full p-2 hover:bg-gray-100 hover:text-black transition-all opacity-0 group-hover:opacity-100 shadow-lg -ml-2 lg:ml-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIndex((i) => (i + 1) % totalSlides)}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 text-gray-600 rounded-full p-2 hover:bg-gray-100 hover:text-black transition-all opacity-0 group-hover:opacity-100 shadow-lg -mr-2 lg:mr-0"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}