"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConfigByTenant } from "@/hooks/config/useConfigByTenant";

interface Slide {
  id: number;
  img: string;
  clickable: boolean;
}

export default function Banner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const moved = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { data: config, isLoading, isError } = useConfigByTenant();

  // Lấy banner từ config
  const slides: Slide[] =
    config?.banner?.map((url: string, idx: number) => ({
      id: idx + 1,
      img: url,
      clickable: true,
    })) || [];

  // Preload images
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new window.Image();
      img.src = slide.img;
    });
  }, [slides]);

  // ⚙️ Hàm tự chạy
  const startAutoPlay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % Math.max(slides.length, 1));
    }, 4000);
  };

  // ⏸️ Dừng chạy
  const stopAutoPlay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Điều khiển autoplay - không chờ hydration
  useEffect(() => {
    if (slides.length === 0) return;
    if (!paused && !dragging) startAutoPlay();
    else stopAutoPlay();
    return stopAutoPlay;
  }, [paused, dragging, slides.length]);

  // 🖱️ Xử lý kéo slide
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
    if (!dragging || slides.length === 0) return;
    const diff = e.clientX - startX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setIndex((i) => (i - 1 + slides.length) % slides.length);
      else setIndex((i) => (i + 1) % slides.length);
    }
    setDragging(false);
  };

  // 🖱️ Click slide → sang trang /san-pham
  const handleClick = (slide: Slide) => {
    if (moved.current || !slide.clickable) return;
    router.push("/san-pham");
  };

  // Loading state
  if (isLoading || isError || !config || slides.length === 0) {
    return (
      <div className="w-full h-[200px] sm:h-[350px] md:h-[500px] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Dải slide */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s: Slide) => (
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
              className="w-full h-[200px] sm:h-[350px] md:h-[500px] object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        ))}
      </div>

      {/* Nút điều hướng - trái */}
      <button
        onClick={() => {
          stopAutoPlay();
          setIndex((i) => (i - 1 + slides.length) % slides.length);
        }}
        aria-label="Slide trước"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 sm:p-3 transition z-10 text-xl sm:text-2xl"
      >
        ‹
      </button>

      {/* Nút điều hướng - phải */}
      <button
        onClick={() => {
          stopAutoPlay();
          setIndex((i) => (i + 1) % slides.length);
        }}
        aria-label="Slide tiếp theo"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 sm:p-3 transition z-10 text-xl sm:text-2xl"
      >
        ›
      </button>

      {/* Chấm chỉ báo - Ẩn trên mobile */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 gap-1.5 z-10 hidden md:flex">
        {slides.map((_: Slide, i: number) => (
          <button
            key={i}
            onClick={() => {
              stopAutoPlay();
              setIndex(i);
            }}
            aria-label={`Chuyển đến slide ${i + 1}`}
            style={{
              width: i === index ? "12px" : "6px",
              height: "6px",
              backgroundColor: i === index ? "white" : "rgba(255,255,255,0.5)",
              borderRadius: "9999px",
              transition: "all 0.3s",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </section>
  );
}
