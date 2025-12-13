"use client";

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Typography,
  Tabs,
  message,
  Modal,
  Skeleton,
  Badge,
  Dropdown,
  Breadcrumb as AntBreadcrumb,
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
  ArrowLeft,
  Menu,
  Home,
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

// Mobile Breadcrumb Component
const MobileBreadcrumb = ({ 
  categoryName, 
  productName, 
  categoryId 
}: { 
  categoryName?: string; 
  productName: string;
  categoryId?: number;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const items = [
    {
      key: 'home',
      label: (
        <Link href="/" className="flex items-center gap-2 py-2">
          <Home size={16} />
          <span>Trang chủ</span>
        </Link>
      ),
    },
    {
      key: 'products',
      label: (
        <Link href="/san-pham" className="flex items-center gap-2 py-2">
          <Package size={16} />
          <span>Sản phẩm</span>
        </Link>
      ),
    },
    ...(categoryName && categoryId ? [{
      key: 'category',
      label: (
        <Link 
          href={`/san-pham?category=${categoryId}`}
          className="flex items-center gap-2 py-2"
        >
          <span>{categoryName}</span>
        </Link>
      ),
    }] : []),
  ];

  return (
    <div className="lg:hidden flex items-center justify-between bg-white px-4 py-3 border-b">
      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Quay lại</span>
      </button>

      {/* Breadcrumb dropdown */}
      <Dropdown
        menu={{ items }}
        trigger={['click']}
        open={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        placement="bottomRight"
        overlayClassName="w-64"
      >
        <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
          <Menu size={20} />
          <span className="text-sm font-medium max-w-[120px] truncate">
            {categoryName || "Danh mục"}
          </span>
        </button>
      </Dropdown>
    </div>
  );
};

// Fix Breadcrumb items type
type BreadcrumbItem = {
  title: React.ReactNode;
  href?: string;
  onClick?: () => void;
};

// Compact Breadcrumb for desktop
const DesktopBreadcrumb = ({ categoryName, productName, categoryId }: { 
  categoryName?: string; 
  productName: string;
  categoryId?: number;
}) => {
  return (
    <nav className="hidden lg:block bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center text-sm">
          {/* Trang chủ */}
          <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
          
          {/* Sản phẩm */}
          <Link href="/san-pham" className="text-gray-500 hover:text-blue-600 transition-colors">
            Sản phẩm
          </Link>
          
          {/* Danh mục (nếu có) */}
          {categoryName && categoryId && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              <Link 
                href={`/san-pham?category=${categoryId}`}
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                {categoryName}
              </Link>
            </>
          )}
          
          {/* Tên sản phẩm */}
          <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">
            {productName}
          </span>
        </div>
      </div>
    </nav>
  );
};

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

// Mobile sticky header
const MobileStickyHeader = ({ 
  productName, 
  finalPrice, 
  onAddToCart,
  onBuyNow,
  isAdding,
  hasVariant
}: { 
  productName: string;
  finalPrice: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isAdding: boolean;
  hasVariant: boolean;
}) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isSticky) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {productName}
          </div>
          <div className="text-lg font-bold text-red-600">
            {formatVND(finalPrice)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="small"
            onClick={onAddToCart}
            disabled={!hasVariant || isAdding}
            loading={isAdding}
            className="!h-10 !rounded-lg !font-medium"
            icon={<ShoppingCart size={16} />}
          >
            Thêm
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={onBuyNow}
            disabled={!hasVariant}
            className="!h-10 !rounded-lg !font-medium"
          >
            Mua
          </Button>
        </div>
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
  const [mainImage, setMainImage] = useState<string | null>(null);

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
      {/* Mobile Breadcrumb */}
      <MobileBreadcrumb 
        categoryName={categoryName}
        productName={product.name}
        categoryId={product.categoryId ?? undefined}
      />

      {/* Desktop Breadcrumb */}
      <DesktopBreadcrumb 
        categoryName={categoryName}
        productName={product.name}
        categoryId={product.categoryId ?? undefined}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Images - Mobile Optimized */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-sm border">
              <Suspense fallback={
                <div className="relative w-full h-[300px] lg:h-[500px] rounded-xl overflow-hidden">
                  <Skeleton.Image active className="!w-full !h-full" />
                </div>
              }>
                <ProductImageGallery
                  currentData={product}
                  productTitle={product.name}
                  mainImage={mainImage}
                  onThumbnailClick={handleThumbnailClick}
                />
              </Suspense>
            </div>
            
            {/* Mobile quick actions */}
            <div className="lg:hidden flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-2 rounded-lg transition-colors ${
                    isWishlisted 
                      ? "text-red-600 bg-red-50" 
                      : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              {discountInfo && (
                <div className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-lg">
                  {discountInfo.type === "PERCENT" ? `-${discountInfo.value}%` : `-${formatVND(discountInfo.value)}`}
                </div>
              )}
            </div>
          </div>

          {/* Product Info - Mobile Optimized */}
          <div className="space-y-4 lg:space-y-6">
            {/* Mobile: Product name and rating at top */}
            <div className="lg:hidden space-y-3">
              <Title level={2} className="!text-xl !font-bold !text-gray-900 !mb-0">
                {product.name}
              </Title>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.floor(avgRating) 
                          ? "text-yellow-400 fill-current" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm font-semibold text-gray-900 ml-1">
                    {avgRating.toFixed(1)}
                  </span>
                </div>
                <div className="h-3 w-px bg-gray-300" />
                <span className="text-sm text-gray-600">
                  {product.totalReviews} đánh giá
                </span>
              </div>
            </div>

            {/* Category & Brand - Mobile Compact */}
            <div className="flex items-center gap-2 flex-wrap">
              {brandName && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {brandName}
                </span>
              )}
              {categoryName && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  {categoryName}
                </span>
              )}
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Còn hàng
              </span>
            </div>

            {/* Desktop: Product Name */}
            <Title level={1} className="hidden lg:block !text-3xl !font-bold !text-gray-900 !mb-2">
              {product.name}
            </Title>

            {/* Desktop: Rating */}
            <div className="hidden lg:flex items-center gap-4">
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
            </div>

            {/* Price Section - Mobile Optimized */}
            <div className="bg-gray-50 rounded-xl lg:rounded-2xl p-4 lg:p-6 space-y-2">
              <div className="flex items-baseline gap-3 lg:gap-4">
                {discountInfo && (
                  <span className="text-lg lg:text-2xl font-bold text-gray-400 line-through">
                    {formatVND(originalPrice)}
                  </span>
                )}
                <span className="text-2xl lg:text-4xl font-bold text-red-600">
                  {formatVND(finalPrice)}
                </span>
              </div>
              
              {discountInfo && (
                <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                  <span className="px-2 lg:px-3 py-1 bg-red-100 text-red-700 font-semibold rounded-lg text-sm lg:text-base">
                    Tiết kiệm {formatVND(discountInfo.saved)}
                  </span>
                  <span className="text-gray-600 text-xs lg:text-sm">
                    {discountInfo.type === "PERCENT" 
                      ? `Giảm ${discountInfo.value}%` 
                      : `Giảm ${formatVND(discountInfo.value)}`}
                  </span>
                </div>
              )}
            </div>

            {/* Gift Promotion - Mobile Compact */}
            {giftProduct && (
              <div className="border border-emerald-200 bg-emerald-50 rounded-xl lg:rounded-2xl p-3 lg:p-5">
                <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                  <Gift className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-800 text-sm lg:text-base">Quà tặng</span>
                  <span className="ml-auto text-xs lg:text-sm text-emerald-700 font-medium">
                    Kèm theo
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-lg lg:rounded-xl p-3">
                  <div className="relative w-12 h-12 lg:w-16 lg:h-16 rounded-lg overflow-hidden border border-emerald-200">
                    <img 
                      src={getImageUrl(giftProduct.thumb) || ''}
                      alt={giftProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm lg:text-base truncate">
                      {giftProduct.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                        x{promo?.giftQuantity}
                      </span>
                      <span className="text-xs lg:text-sm text-emerald-600 font-medium">
                        Miễn phí
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Attributes Display - Mobile Compact */}
            {Object.keys(selectedAttributes).length > 0 && (
              <div className="bg-blue-50 rounded-xl p-3 lg:p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2 lg:mb-3">
                  <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                  <span className="font-medium text-blue-800 text-sm lg:text-base">Đã chọn</span>
                </div>
                <div className="space-y-2 lg:space-y-3">
                  {Object.entries(selectedAttributes).map(([attrId, valueId]) => {
                    const attributeName = attributeMap[parseInt(attrId)] || `Thuộc tính ${attrId}`;
                    const valueName = getAttributeValueName(valueId);
                    
                    return (
                      <div key={attrId} className="flex items-center justify-between bg-white rounded-lg p-2 lg:p-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs lg:text-sm text-gray-600 truncate">{attributeName}</div>
                          <div className="font-medium text-gray-900 text-sm truncate">{valueName}</div>
                        </div>
                        <button
                          onClick={() => {
                            const newAttrs = { ...selectedAttributes };
                            delete newAttrs[attrId];
                            setSelectedAttributes(newAttrs);
                          }}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 ml-2"
                        >
                          <RotateCcw className="w-3 h-3 lg:w-4 lg:h-4" />
                          Đổi
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Attributes Selection - Mobile Optimized */}
            {availableAttributes.length > 0 && (
              <div className="space-y-4 lg:space-y-6">
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

            {/* Selected Variant Info - Mobile Compact */}
            {selectedVariant && (
              <div className="bg-green-50 rounded-xl p-3 lg:p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                  <span className="font-medium text-green-800 text-sm lg:text-base">Biến thể đã chọn</span>
                  <span className="ml-auto text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                    Còn hàng
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="text-gray-600 text-xs">Mã SKU</div>
                    <div className="font-medium text-sm truncate">{selectedVariant.sku}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons - Mobile Optimized */}
            <div className="lg:space-y-4 pt-4">
              <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              
              {/* Mobile action buttons (will be hidden by sticky header when scrolling) */}
              <div className="lg:hidden grid grid-cols-2 gap-3">
                <Button
                  type="primary"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || isAdding}
                  loading={isAdding}
                  icon={<ShoppingCart size={18} />}
                  className="!h-12 !rounded-lg !font-medium"
                >
                  Thêm vào giỏ
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={!selectedVariant}
                  className="!h-12 !rounded-lg !font-medium !bg-gradient-to-r !from-orange-500 !to-red-500 !text-white !border-0"
                >
                  Mua ngay
                </Button>
              </div>
              
              {!selectedVariant && Object.keys(selectedAttributes).length > 0 && (
                <div className="text-center py-2 lg:py-3">
                  <Text type="warning" className="!text-xs lg:!text-sm">
                    ⚠️ Biến thể này hiện không có sẵn
                  </Text>
                </div>
              )}
            </div>

            {/* Service Features - Mobile Compact */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 pt-4 lg:pt-6 border-t">
              <div className="text-center p-2 lg:p-3">
                <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-lg mb-1 lg:mb-2">
                  <Truck className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                </div>
                <div className="text-xs font-medium text-gray-900">Giao hàng</div>
                <div className="text-xs text-gray-600">Miễn phí</div>
              </div>
              <div className="text-center p-2 lg:p-3">
                <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-lg mb-1 lg:mb-2">
                  <RotateCcw className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                </div>
                <div className="text-xs font-medium text-gray-900">Đổi trả</div>
                <div className="text-xs text-gray-600">7 ngày</div>
              </div>
              <div className="text-center p-2 lg:p-3">
                <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-purple-100 rounded-lg mb-1 lg:mb-2">
                  <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                </div>
                <div className="text-xs font-medium text-gray-900">Bảo hành</div>
                <div className="text-xs text-gray-600">Chính hãng</div>
              </div>
              <div className="text-center p-2 lg:p-3">
                <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-orange-100 rounded-lg mb-1 lg:mb-2">
                  <Package className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
                </div>
                <div className="text-xs font-medium text-gray-900">Giao nhanh</div>
                <div className="text-xs text-gray-600">2-3 ngày</div>
              </div>
            </div>

            {/* Desktop wishlist and share */}
            <div className="hidden lg:flex items-center gap-3 pt-6">
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
          </div>
        </div>

        {/* Product Description - Mobile Tab View */}
        <div className="mt-6 lg:mt-12 bg-white rounded-xl lg:rounded-2xl shadow-sm border overflow-hidden">
          <Tabs
            defaultActiveKey="description"
            size="small"
            className="px-4 lg:px-6 pt-3 lg:pt-4"
            items={[
              {
                key: "description",
                label: (
                  <span className="text-sm lg:text-base font-medium">
                    Mô tả sản phẩm
                  </span>
                ),
                children: (
                  <div className="py-4 lg:py-6">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.description || 
                          '<div class="text-gray-500 text-center py-6 lg:py-8">Chưa có mô tả chi tiết cho sản phẩm này.</div>',
                      }}
                      className="prose max-w-none text-gray-700 text-sm lg:text-base"
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Rating Section */}
        <div className="mt-6 lg:mt-8">
          <Suspense fallback={
            <div className="bg-white rounded-xl p-4">
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          }>
            {productId && <RatingComponent productId={productId} />}
          </Suspense>
        </div>
      </div>

      {/* Mobile Sticky Header */}
      <MobileStickyHeader
        productName={product.name}
        finalPrice={finalPrice}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isAdding={isAdding}
        hasVariant={!!selectedVariant}
      />

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