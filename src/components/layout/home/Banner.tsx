"use client"

import { useState, useEffect } from "react"

const slides = [
  { id: 1, img: "/image/slider1.jpg" },
  { id: 2, img: "/image/slider2.jpg" },
  { id: 3, img: "/image/slider3.jpg" },
]

export default function Banner() {
  const [index, setIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000)
    return () => clearInterval(timer)
  }, [mounted])

  if (!mounted) return null

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s) => (
          <div key={s.id} className="w-full flex-shrink-0 relative">
            <img
              src={s.img}
              alt={`Slide ${s.id}`}
              className="w-full h-[250px] sm:h-[350px] md:h-[500px] object-cover"
            />
          </div>
        ))}
      </div>

      {/* Nút điều hướng trái/phải */}
      <button
        onClick={() =>
          setIndex((index - 1 + slides.length) % slides.length)
        }
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition"
      >
        ‹
      </button>
      <button
        onClick={() => setIndex((index + 1) % slides.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition"
      >
        ›
      </button>

      {/* Chấm chỉ báo slide */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === index ? "bg-white scale-110" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
