"use client";

import { useState, useRef, useEffect } from "react";
import { usePromotedProducts } from "@/hooks/product/usePromotedProducts";
import { Product } from "@/types/product.type";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import ProductCardPromoted from "../product/ProductCardPromoted";
import Link from "next/link";

const CountdownTimer = () => {
  const boxStyle = "bg-black text-white text-xs font-bold px-1.5 py-0.5 rounded min-w-[24px] text-center";
  return (
    <div className="flex items-center gap-1 text-xs">
      <div className={boxStyle}>02</div>
      <span className="font-bold">:</span>
      <div className={boxStyle}>59</div>
      <span className="font-bold">:</span>
      <div className={boxStyle}>45</div>
    </div>
  );
};

export default function FlashDeals() {
  const [page] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(5);
  
  const { data: productsResponse, isLoading } = usePromotedProducts({ page, limit: 12 });
  const products = ((productsResponse?.data as Product[]) || []).filter((p) => p.isPublished);
  const totalSlides = Math.ceil(products.length / itemsPerSlide);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerSlide(2);
      else if (window.innerWidth < 1024) setItemsPerSlide(4);
      else setItemsPerSlide(5);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);

  const getCurrentProducts = () => {
    const start = currentIndex * itemsPerSlide;
    return products.slice(start, start + itemsPerSlide);
  };

  if (isLoading || products.length === 0) return null;

  return (
    <section className="py-8 bg-white border-b border-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2 uppercase">
              <Zap className="text-red-600 w-5 h-5 fill-current" />
              Flash Sale
            </h2>
            <div className="hidden sm:block">
               <CountdownTimer />
            </div>
          </div>
          <Link href="/san-pham" className="text-xs font-semibold text-gray-500 hover:text-black">
            Xem tất cả
          </Link>
        </div>

        {/* Slider Content */}
        <div className="relative group">
          {/* Navigation Buttons */}
          {totalSlides > 1 && (
            <>
              <button onClick={prevSlide} className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow border border-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextSlide} className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow border border-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex">
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {getCurrentProducts().map((product, index) => (
              <div key={product.id} className="h-full">
                <ProductCardPromoted product={product} index={index} />
              </div>
            ))}
          </div>

          {/* Indicators - Đã Fix kích thước */}
          {totalSlides > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-6 p-0 m-0">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  // QUAN TRỌNG: !p-0 !m-0 !border-0 để reset style button mặc định
                  className={`
                    !p-0 !m-0 !border-0 !outline-none !min-w-0 !min-h-0 flex-shrink-0
                    transition-all duration-300 rounded-full
                    ${i === currentIndex 
                      ? "!w-6 !h-1.5 bg-red-600" // Active: Dài 24px, cao 6px
                      : "!w-1.5 !h-1.5 bg-gray-200 hover:bg-gray-300" // Inactive: Tròn 6px
                    }
                  `}
                  aria-label={`Flash deal page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}