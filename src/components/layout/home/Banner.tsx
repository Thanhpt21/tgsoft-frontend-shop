"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConfigByTenant } from "@/hooks/config/useConfigByTenant";
import Image from "next/image";

export default function Banner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);
  const startX = useRef(0);
  const moved = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { data: config, isLoading, isError } = useConfigByTenant();

  const slides = config?.banner?.map((url: string, idx: number) => ({
    id: idx + 1,
    img: url,
    clickable: true,
  })) || [];

  // Hydration check
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Hiển thị ngay khi có slides, không cần chờ load ảnh
  useEffect(() => {
    if (slides.length > 0 && isHydrated) {
      setFirstImageLoaded(true);
    }
  }, [slides, isHydrated]);

  // Auto play effect
  useEffect(() => {
    if (!isHydrated || slides.length === 0) return;
    
    const startAutoPlay = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % slides.length);
      }, 4000);
    };

    const stopAutoPlay = () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };

    if (!paused && !dragging) startAutoPlay();
    else stopAutoPlay();
    
    return stopAutoPlay;
  }, [paused, dragging, isHydrated, slides.length]);

  // Early returns after all hooks
  if (isLoading || isError || !config) {
    return (
      <div className="w-full h-[250px] sm:h-[350px] md:h-[500px] bg-gray-200" />
    );
  }

  if (slides.length === 0) {
    return (
      <div className="w-full h-[250px] sm:h-[350px] md:h-[500px] bg-gray-200" />
    );
  }

  const stopAutoPlay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

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
      if (diff > 0) setIndex((i) => (i - 1 + slides.length) % slides.length);
      else setIndex((i) => (i + 1) % slides.length);
    }
    setDragging(false);
  };

  const handleClick = (slide: { clickable: boolean }) => {
    if (moved.current || !slide.clickable) return;
    router.push("/san-pham");
  };

  return (
    <section
      className="relative w-full overflow-hidden select-none bg-gray-100 z-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ 
        minHeight: '200px',
        height: 'auto'
      }}
    >
      {/* Dải slide */}
      <div
        className="flex"
        style={{ 
          transform: `translateX(-${index * 100}%)`,
          transition: "transform 0.7s ease-in-out"
        }}
      >
        {slides.map((s: { id: number; img: string; clickable: boolean }, idx: number) => (
          <div
            key={s.id}
            className={`w-full flex-shrink-0 relative ${
              s.clickable ? "cursor-pointer" : "cursor-default"
            }`}
            onClick={() => handleClick(s)}
          >
            <img
              src={s.img}
              alt={`Slide ${s.id}`}
              loading={idx === 0 ? "eager" : "lazy"}
              className="w-full h-[200px] sm:h-[350px] md:h-[500px] object-cover block"
              style={{ 
                imageRendering: idx === 0 ? 'crisp-edges' : 'auto',
                display: 'block'
              }}
            />
          </div>
        ))}
      </div>

      {/* Nút điều hướng */}
      <button
        onClick={() => {
          stopAutoPlay();
          setIndex((i) => (i - 1 + slides.length) % slides.length);
        }}
        aria-label="Slide trước"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition z-10"
      >
        ‹
      </button>
      <button
        onClick={() => {
          stopAutoPlay();
          setIndex((i) => (i + 1) % slides.length);
        }}
        aria-label="Slide tiếp theo"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition z-10"
      >
        ›
      </button>

      {/* Chấm chỉ báo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_: any, i: number) => (
          <button
            key={i}
            onClick={() => {
              stopAutoPlay();
              setIndex(i);
            }}
            aria-label={`Chuyển đến slide ${i + 1}`}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              i === index ? "bg-white scale-110" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}