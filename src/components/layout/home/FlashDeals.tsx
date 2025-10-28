"use client"

import { useEffect, useState } from "react"
import { Image, Rate } from "antd"
import { getImageUrl } from "@/utils/getImageUrl"
import Link from "next/link"

interface Product {
  id: number
  name: string
  thumb?: string | null
  price?: number | null
  basePrice?: number | null
}

export default function FlashDeals() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const fetchProducts = async () => {
      try {
        const res = await fetch("https://api.aiban.vn/products/all/list/2")
        if (!res.ok) throw new Error("Lỗi kết nối API")

        const json = await res.json()
        const data = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : []

        setProducts(data)
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          🔥 Flash Sale
        </h2>
        {!mounted || loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="bg-gray-200 h-80"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => {
              const discount = p.basePrice && p.price && p.price < p.basePrice
                ? Math.round((1 - p.price / p.basePrice) * 100)
                : 0
              // Use product ID to generate consistent rating
              const rating = 4 + (p.id % 10) / 20
              const reviewCount = 1

              return (
                <Link
                  href={`/san-pham/${p.id}`}
                  key={p.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative bg-gray-100 aspect-square overflow-hidden">
                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-4 right-4 z-10 bg-pink-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                        {discount}% off
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="w-full h-full p-8">
                      <Image
                        src={getImageUrl(p.thumb) || "/images/no-image.png"}
                        alt={p.name || "Sản phẩm"}
                        preview={false}
                        className="group-hover:scale-105 transition-transform duration-500"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Category */}
                    <p className="text-blue-500 text-sm font-medium mb-2">
                      Watches
                    </p>

                    {/* Product Name */}
                    <h3 className="text-gray-900 font-semibold text-base mb-3 line-clamp-2 min-h-[3rem] leading-tight">
                      {p.name || "Chưa có tên"}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-gray-900 font-medium">
                        ({rating.toFixed(1)})
                      </span>
                      <Rate
                        disabled
                        allowHalf
                        value={rating}
                        style={{ fontSize: '14px' }}
                        className="text-yellow-400"
                      />
                      <span className="text-gray-500 text-sm">
                        ({reviewCount}) Reviews
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-3 mt-auto">
                      {discount > 0 && p.basePrice && (
                        <span className="text-gray-400 line-through text-base">
                          ${(p.basePrice / 1000).toFixed(2)}
                        </span>
                      )}
                      <span className="text-green-500 font-bold text-xl">
                        {p.price
                          ? (p.price / 1000).toFixed(2)
                          : p.basePrice
                          ? (p.basePrice / 1000).toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Không có sản phẩm nào.</p>
          </div>
        )}
      </div>
    </section>
  )
}