"use client";

import { useEffect, useState } from "react";
import { Image } from "antd";
import { getImageUrl } from "@/utils/getImageUrl";
import { Heart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  thumb: string | null;
  price?: number;
  basePrice?: number;
  category?: string;
  isNew?: boolean;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("https://api.aiban.vn/products/all/list");
        const json = await res.json();
        const data: Product[] = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];
        setProducts(data);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          🔥 Sản phẩm
        </h2>

        {loading ? (
          // Skeleton loading
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-2xl shadow-sm p-4"
              >
                <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-4 group"
              >
                {/* Tag JUST IN! */}
                {p.isNew && (
                  <div className="absolute top-4 left-4 bg-[#ff5a5a] text-white text-xs font-semibold py-1 px-2 rounded-md shadow">
                    JUST IN!
                  </div>
                )}

                {/* Icon tim */}
                <button
                  onClick={() => toggleFavorite(p.id)}
                  className="absolute top-4 right-4 p-1 bg-white rounded-full shadow-sm hover:scale-110 transition"
                >
                  <Heart
                    className={`w-5 h-5 transition ${
                      favorites.includes(p.id)
                        ? "text-red-500 fill-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </button>

                {/* Ảnh */}
                <div className="w-full aspect-square overflow-hidden rounded-xl mb-3">
                  <Image
                    src={getImageUrl(p.thumb) || "/placeholder.png"}
                    alt={p.name}
                    preview={false}
                    className="w-full h-56 object-cover rounded-lg"
                  />
                </div>

                {/* Thông tin */}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {p.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {p.category || "Sản phẩm"}
                  </p>
                  <p className="text-[#ff5a5a] font-semibold mt-1">
                    {p.basePrice
                      ? `${p.basePrice.toLocaleString("vi-VN")}₫`
                      : "Liên hệ"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-8">
            Không có sản phẩm nào.
          </p>
        )}
      </div>
    </section>
  );
}
