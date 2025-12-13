"use client";

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Typography,
  Tabs,
  message,
  Modal,
  Tag,
  Rate,
  Skeleton,
  Tooltip,
  Badge,
} from "antd";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingCart,
  Zap,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Star,
  Gift,
  Heart,
  Share2,
  CheckCircle,
  Package,
  Clock,
} from "lucide-react";

// Lazy load components
const RatingComponent = lazy(() => import("@/components/layout/rating/RatingComponent"));

import { useProductBySlug } from "@/hooks/product/useProductBySlug";
import { useProductVariants } from "@/hooks/product-variant/useProductVariants";
import { useAttributeValues } from "@/hooks/attribute-value/useAttributeValues";
import { useAllAttributes } from "@/hooks/attribute/useAllAttributes";
import { useAllCategories } from "@/hooks/category/useAllCategories";
import { useAllBrands } from "@/hooks/brand/useAllBrands";
import { useAddCartItemWithOptimistic } from "@/hooks/cart/useAddCartItemWithOptimistic";
import { getImageUrl } from "@/utils/getImageUrl";
import { Product } from "@/types/product.type";
import { ProductVariant } from "@/types/product-variant.type";
import { formatVND } from "@/utils/helpers";
import ProductImageGallery from "@/components/layout/product/ProductImageGallery";

const { Title, Text } = Typography;

// Loading skeleton
const ProductDetailSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <Skeleton active paragraph={false} className="!w-64" />
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <Skeleton.Image active className="!w-full !h-[500px] rounded-2xl" />
        <div className="space-y-6">
          <Skeleton active paragraph={{ rows: 2 }} />
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton active paragraph={{ rows: 3 }} />
          <Skeleton.Button active size="large" className="!w-full" />
          <Skeleton.Button active size="large" className="!w-full" />
        </div>
      </div>
    </div>
  </div>
);

// Helper component for Attribute Selection
const AttributeSelection = ({ 
  attr, 
  variants, 
  allAttributeValues,
  selectedAttributes,
  onSelect 
}: { 
  attr: any;
  variants: any[];
  allAttributeValues: any;
  selectedAttributes: Record<string, number>;
  onSelect: (attrId: string, valueId: number) => void;
}) => {
  // Calculate available values for this attribute based on current selection
  const availableValues = useMemo(() => {
    if (!variants || !allAttributeValues?.data) return [];
    
    // Filter variants based on current selection
    const filteredVariants = variants.filter(variant => {
      return Object.entries(selectedAttributes).every(([selectedAttrId, selectedValueId]) => {
        return variant.attrValues?.[selectedAttrId] === selectedValueId;
      });
    });
    
    // Get unique attribute values from filtered variants
    const valueIds = new Set<number>();
    filteredVariants.forEach(variant => {
      const valueId = variant.attrValues?.[attr.id.toString()];
      if (valueId) valueIds.add(valueId);
    });
    
    // Get attribute value objects
    return allAttributeValues.data.filter((av: any) => 
      av.attributeId === attr.id && valueIds.has(av.id)
    );
  }, [variants, allAttributeValues, selectedAttributes, attr.id]);

  if (availableValues.length === 0) return null;

  return (
    <div className="space-y-3">
      <label className="font-semibold text-gray-900">
        {attr.name}
      </label>
      <div className="flex flex-wrap gap-2">
        {availableValues.map((av: any) => (
          <button
            key={av.id}
            onClick={() => {
              onSelect(attr.id.toString(), av.id);
            }}
            className={`
              px-4 py-2.5 rounded-lg border-2 transition-all duration-200
              border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700
            `}
          >
            <span>{av.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // States
  const [isAdding, setIsAdding] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, number>>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null); // Thêm state cho ảnh chính

  // Data fetching
  const { 
    data: product, 
    isLoading: loadingProduct, 
    isError 
  } = useProductBySlug({ slug: slug as string});

  const productId = product?.id;
  
  const { data: variants } = useProductVariants(productId);
  const { data: allAttributes } = useAllAttributes();
  const { data: allAttributeValues } = useAttributeValues();
  const { data: allCategories } = useAllCategories();
  const { data: allBrands } = useAllBrands();
  const addToCart = useAddCartItemWithOptimistic();

  // Memoized data
  const attributeMap = useMemo(() => 
    allAttributes?.reduce((acc: Record<number, string>, attr: any) => {
      acc[attr.id] = attr.name;
      return acc;
    }, {}) ?? {}, 
    [allAttributes]
  );

  // Get attribute value name from ID
  const getAttributeValueName = useCallback((valueId: number) => {
    const attrValue = allAttributeValues?.data?.find((av: any) => av.id === valueId);
    return attrValue?.value || `Giá trị ${valueId}`;
  }, [allAttributeValues]);

  // Filter attributes that have variants
  const availableAttributes = useMemo(() => {
    if (!variants || !allAttributes) return [];
    
    const usedAttributes = new Set<number>();
    
    variants.forEach(variant => {
      Object.keys(variant.attrValues || {}).forEach(attrId => {
        usedAttributes.add(parseInt(attrId));
      });
    });
    
    return allAttributes.filter((attr: any) => usedAttributes.has(attr.id));
  }, [variants, allAttributes]);

  const categoryName = useMemo(() => 
    allCategories?.find((cat: any) => cat.id === product?.categoryId)?.name,
    [allCategories, product]
  );

  const brandName = useMemo(() =>
    allBrands?.find((brand: any) => brand.id === product?.brandId)?.name,
    [allBrands, product]
  );

  // Variant selection
  useEffect(() => {
    if (!variants || !product) return;

    const matched = variants.find((v) => {
      return Object.entries(v.attrValues || {}).every(([attrId, valueId]) => {
        return selectedAttributes[attrId] === valueId;
      });
    });

    setSelectedVariant(matched ?? null);
  }, [selectedAttributes, variants, product]);

  // Calculate main image
  const calculatedMainImage = useMemo(() => {
    if (selectedVariant?.thumb) {
      return getImageUrl(selectedVariant.thumb);
    }
    return getImageUrl(product?.thumb ?? null);
  }, [selectedVariant, product]);

  // Initialize main image when product or variant changes
  useEffect(() => {
    setMainImage(calculatedMainImage);
  }, [calculatedMainImage]);

  // Price calculations
  const { originalPrice, finalPrice, discountInfo } = useMemo(() => {
    if (!product) return { originalPrice: 0, finalPrice: 0, discountInfo: null };

    const basePrice = selectedVariant?.priceDelta || product.basePrice;
    const promo = product.promotionProducts?.[0];

    if (!promo) {
      return { originalPrice: basePrice, finalPrice: basePrice, discountInfo: null };
    }

    let discountedPrice = basePrice;
    
    if (promo.discountType === "PERCENT") {
      discountedPrice = basePrice * (1 - promo.discountValue / 100);
    } else if (promo.discountType === "FIXED") {
      discountedPrice = Math.max(0, basePrice - promo.discountValue);
    }

    return {
      originalPrice: basePrice,
      finalPrice: Math.round(discountedPrice),
      discountInfo: {
        type: promo.discountType,
        value: promo.discountValue,
        saved: basePrice - discountedPrice
      }
    };
  }, [product, selectedVariant]);

  // Rating
  const avgRating = useMemo(() => {
    if (!product || product.totalReviews === 0) return 0;
    return Math.round((product.totalRatings / product.totalReviews) * 10) / 10;
  }, [product]);

  // Promotion info
  const promo = product?.promotionProducts?.[0];
  const giftProduct = promo?.giftProduct;

  // Event handlers
  const handleAddToCart = useCallback(() => {
    if (!selectedVariant || !product) return;

    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    if (isAdding) return;
    setIsAdding(true);

    addToCart(
      { productVariantId: selectedVariant.id, quantity: 1 },
      {
        onOptimisticSuccess: () => {
          message.success("Đã thêm vào giỏ hàng!");
          setTimeout(() => setIsAdding(false), 300);
        },
        onError: () => setIsAdding(false),
      }
    );
  }, [selectedVariant, product, isAuthenticated, isAdding, addToCart]);

  const handleBuyNow = useCallback(() => {
    if (!selectedVariant || !product || !isAuthenticated) {
      if (!isAuthenticated) setIsLoginModalOpen(true);
      return;
    }

    addToCart(
      { productVariantId: selectedVariant.id, quantity: 1 },
      {
        onOptimisticSuccess: () => {
          message.success("Đã thêm vào giỏ!");
          router.push("/dat-hang");
        },
      }
    );
  }, [selectedVariant, product, isAuthenticated, addToCart, router]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Xem sản phẩm ${product?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success("Đã sao chép link!");
    }
  }, [product]);

  const handleAttributeSelect = useCallback((attrId: string, valueId: number) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attrId]: valueId
    }));
  }, []);

  // Thêm hàm xử lý khi click thumbnail
  const handleThumbnailClick = useCallback((imageUrl: string) => {
    setMainImage(imageUrl);
  }, []);

  // Reset selection when product changes
  useEffect(() => {
    setSelectedAttributes({});
    setSelectedVariant(null);
    // Reset main image khi product thay đổi
    if (product?.thumb) {
      setMainImage(getImageUrl(product.thumb));
    }
  }, [productId, product]);

  // Loading and error states
  if (loadingProduct) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-4xl mb-4 text-red-500">⚠️</div>
          <Title level={3} className="!mb-4 text-gray-800">Không tìm thấy sản phẩm</Title>
          <p className="text-gray-600 mb-6">Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.back()} className="rounded-lg">
              Quay lại
            </Button>
            <Button type="primary" onClick={() => router.push("/san-pham")} className="rounded-lg">
              Xem sản phẩm khác
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">
                Trang chủ
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link href="/san-pham" className="ml-2 text-gray-500 hover:text-blue-600 transition-colors">
                Sản phẩm
              </Link>
            </li>
            {categoryName && (
              <li className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link 
                  href={`/san-pham?category=${product.categoryId}`}
                  className="ml-2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {categoryName}
                </Link>
              </li>
            )}
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="ml-2 text-gray-900 font-medium truncate max-w-[200px]">
                {product.name}
              </span>
            </li>
          </ol>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border">
              <Suspense fallback={<Skeleton.Image active className="!w-full !h-[500px] rounded-xl" />}>
                <ProductImageGallery
                  currentData={product}
                  productTitle={product.name}
                  mainImage={mainImage}
                  onThumbnailClick={handleThumbnailClick}
                />
              </Suspense>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isWishlisted 
                      ? "text-red-600 bg-red-50" 
                      : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                  <span className="text-sm font-medium">Yêu thích</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Chia sẻ</span>
                </button>
              </div>
              {discountInfo && (
                <Badge.Ribbon 
                  text={discountInfo.type === "PERCENT" ? `-${discountInfo.value}%` : `-${discountInfo.value}đ`}
                  color="red"
                  className="text-sm font-bold"
                />
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Brand */}
            <div className="flex items-center gap-3">
              {brandName && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  {brandName}
                </span>
              )}
              {categoryName && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                  {categoryName}
                </span>
              )}
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                Còn hàng
              </span>
            </div>

            {/* Product Name */}
            <Title level={1} className="!text-3xl !font-bold !text-gray-900 !mb-2">
              {product.name}
            </Title>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < Math.floor(avgRating) 
                          ? "text-yellow-400 fill-current" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <span className="text-gray-600">
                {product.totalReviews} đánh giá
              </span>
              <div className="h-4 w-px bg-gray-300" />
            </div>

            {/* Price Section */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-2">
              <div className="flex items-baseline gap-4">
                {discountInfo && (
                  <span className="text-2xl font-bold text-gray-400 line-through">
                    {formatVND(originalPrice)}
                  </span>
                )}
                <span className="text-4xl font-bold text-red-600">
                  {formatVND(finalPrice)}
                </span>
              </div>
              
              {discountInfo && (
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-red-100 text-red-700 font-semibold rounded-lg">
                    Tiết kiệm {formatVND(discountInfo.saved)}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {discountInfo.type === "PERCENT" 
                      ? `Giảm ${discountInfo.value}%` 
                      : `Giảm ${formatVND(discountInfo.value)}`}
                  </span>
                </div>
              )}
            </div>

            {/* Gift Promotion */}
            {giftProduct && (
              <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Gift className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-800">Quà tặng đặc biệt</span>
                  <span className="ml-auto text-sm text-emerald-700 font-medium">
                    Khi mua sản phẩm này
                  </span>
                </div>
                <div className="flex items-center gap-4 bg-white rounded-xl p-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-200">
                    <img 
                      src={getImageUrl(giftProduct.thumb) || ''}
                      alt={giftProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {giftProduct.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        count={`x${promo?.giftQuantity}`} 
                        className="bg-emerald-500"
                      />
                      <span className="text-sm text-emerald-600 font-medium">
                        Miễn phí
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Attributes Display */}
            {Object.keys(selectedAttributes).length > 0 && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Thuộc tính đã chọn</span>
                </div>
                <div className="space-y-3">
                  {Object.entries(selectedAttributes).map(([attrId, valueId]) => {
                    const attributeName = attributeMap[parseInt(attrId)] || `Thuộc tính ${attrId}`;
                    const valueName = getAttributeValueName(valueId);
                    
                    return (
                      <div key={attrId} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div>
                          <div className="text-sm text-gray-600">{attributeName}</div>
                          <div className="font-medium text-gray-900">{valueName}</div>
                        </div>
                        <button
                          onClick={() => {
                            const newAttrs = { ...selectedAttributes };
                            delete newAttrs[attrId];
                            setSelectedAttributes(newAttrs);
                          }}
                          className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Đổi
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Attributes Selection */}
            {availableAttributes.length > 0 && (
              <div className="space-y-6">
                {availableAttributes.map((attr: any) => {
                  // Skip if attribute already selected
                  if (selectedAttributes[attr.id.toString()]) return null;
                  
                  return (
                    <AttributeSelection
                      key={attr.id}
                      attr={attr}
                      variants={variants || []}
                      allAttributeValues={allAttributeValues}
                      selectedAttributes={selectedAttributes}
                      onSelect={handleAttributeSelect}
                    />
                  );
                })}
              </div>
            )}

            {/* Selected Variant Info */}
            {selectedVariant && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Biến thể đã chọn</span>
                  <span className="ml-auto text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                    Còn hàng
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-gray-600">Mã SKU</div>
                    <div className="font-medium">{selectedVariant.sku}</div>
                  </div>
                 
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || isAdding}
                  loading={isAdding}
                  icon={<ShoppingCart className="w-5 h-5" />}
                  className="!h-14 !rounded-xl !font-semibold !text-base !bg-gradient-to-r !from-blue-600 !to-blue-700 hover:!from-blue-700 hover:!to-blue-800 !border-0 shadow-lg hover:shadow-xl transition-all"
                >
                  {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
                </Button>
                <Button
                  size="large"
                  onClick={handleBuyNow}
                  disabled={!selectedVariant}
                  icon={<Zap className="w-5 h-5" />}
                  className="!h-14 !rounded-xl !font-semibold !text-base !bg-gradient-to-r !from-orange-500 !to-red-500 hover:!from-orange-600 hover:!to-red-600 !text-white !border-0 shadow-lg hover:shadow-xl transition-all"
                >
                  Mua ngay
                </Button>
              </div>
              
              {!selectedVariant && Object.keys(selectedAttributes).length > 0 && (
                <div className="text-center py-3">
                  <Text type="warning" className="!text-sm">
                    ⚠️ Biến thể này hiện không có sẵn
                  </Text>
                </div>
              )}
            </div>

            {/* Service Features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t">
              <div className="text-center p-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-xs text-gray-600">Miễn phí vận chuyển</div>
              </div>
              <div className="text-center p-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mb-2">
                  <RotateCcw className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-xs text-gray-600">Đổi trả 7 ngày</div>
              </div>
              <div className="text-center p-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mb-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-xs text-gray-600">Bảo hành chính hãng</div>
              </div>
              <div className="text-center p-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg mb-2">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-xs text-gray-600">Giao hàng nhanh</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border overflow-hidden">
          <Tabs
            defaultActiveKey="description"
            size="large"
            className="px-6 pt-4"
            items={[
              {
                key: "description",
                label: "Mô tả sản phẩm",
                children: (
                  <div className="py-6">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.description || 
                          '<div class="text-gray-500 text-center py-8">Chưa có mô tả chi tiết cho sản phẩm này.</div>',
                      }}
                      className="prose max-w-none text-gray-700"
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Rating Section */}
        <div className="mt-8">
          <Suspense fallback={<Skeleton active paragraph={{ rows: 3 }} />}>
            {productId && <RatingComponent productId={productId} />}
          </Suspense>
        </div>
      </div>

      {/* Login Modal */}
      <Modal
        open={isLoginModalOpen}
        onCancel={() => setIsLoginModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsLoginModalOpen(false)}>
            Để sau
          </Button>,
          <Button 
            key="login" 
            type="primary" 
            onClick={() => {
              setIsLoginModalOpen(false);
              router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            }}
          >
            Đăng nhập ngay
          </Button>,
        ]}
        centered
        className="rounded-2xl"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
          <Title level={4} className="!mb-2 !text-gray-900">Đăng nhập để tiếp tục</Title>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng và mua sắm.
          </p>
        </div>
      </Modal>
    </div>
  );
}