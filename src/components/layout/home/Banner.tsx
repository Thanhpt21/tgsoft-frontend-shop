"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useConfigByTenant } from "@/hooks/config/useConfigByTenant"

export default function Banner() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const moved = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const { data: config, isLoading, isError } = useConfigByTenant();

  // Nếu data chưa có thì chưa render
  if (isLoading || isError || !config) {
    return <div className="w-full h-[250px] sm:h-[350px] md:h-[500px] bg-gray-200" />
  }

  // Lấy banner từ config
  const slides = config.banner.map((url: any, idx: any) => ({
    id: idx + 1,
    img: url,
    clickable: true, // nếu muốn từng banner khác nhau có thể lưu thêm trong config
  }))

  // ⚙️ Hàm tự chạy
  const startAutoPlay = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 4000)
  }

  // ⏸️ Dừng chạy
  const stopAutoPlay = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // Điều khiển autoplay
  useEffect(() => {
    if (!paused && !dragging) startAutoPlay()
    else stopAutoPlay()
    return stopAutoPlay
  }, [paused, dragging])

  // 🖱️ Xử lý kéo slide
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    startX.current = e.clientX
    moved.current = false
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    const diff = e.clientX - startX.current
    if (Math.abs(diff) > 10) moved.current = true
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragging) return
    const diff = e.clientX - startX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) setIndex((i) => (i - 1 + slides.length) % slides.length)
      else setIndex((i) => (i + 1) % slides.length)
    }
    setDragging(false)
  }

  // 🖱️ Click slide → sang trang /san-pham
  const handleClick = (slide: any) => {
    if (moved.current || !slide.clickable) return
    router.push("/san-pham")
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
        {slides.map((s: any) => (
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
              className="w-full h-[200px] sm:h-[350px] md:h-[500px] sm:object-cover bg-gray-100"
            />
          </div>
        ))}
      </div>

      {/* Nút điều hướng */}
      <button
        onClick={() => {
          stopAutoPlay()
          setIndex((i) => (i - 1 + slides.length) % slides.length)
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition z-10"
      >
        ‹
      </button>
      <button
        onClick={() => {
          stopAutoPlay()
          setIndex((i) => (i + 1) % slides.length)
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition z-10"
      >
        ›
      </button>

      {/* Chấm chỉ báo */}
<<<<<<< HEAD
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
=======
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_: any, i: any) => (
>>>>>>> 1d0fff015a08a4f694dbecb1bda51a629ec00392
          <div
            key={i}
            onClick={() => {
              stopAutoPlay()
              setIndex(i)
            }}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              i === index ? "bg-white scale-110" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  )
}