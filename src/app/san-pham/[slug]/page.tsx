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
  Tag,
  Rate,
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
  Package,
  ArrowLeft,
  Menu,
  Home,
  Tag as TagIcon,
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

const { Title, Text, Paragraph } = Typography;

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
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Quay lại</span>
      </button>

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

// Desktop Breadcrumb
const DesktopBreadcrumb = ({ categoryName, productName, categoryId }: { 
  categoryName?: string; 
  productName: string;
  categoryId?: number;
}) => {
  return (
    <nav className="hidden lg:block bg-white border-b">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-0 py-3">
        <div className="flex items-center text-sm">
          <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
          
          <Link href="/san-pham" className="text-gray-500 hover:text-blue-600 transition-colors">
            Sản phẩm
          </Link>
          
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
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-0 py-3">
        <Skeleton active paragraph={false} className="!w-64" />
      </div>
    </div>
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
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

// Attribute Selection Component
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
  const availableValues = useMemo(() => {
    if (!variants || !allAttributeValues?.data) return [];
    
    const filteredVariants = variants.filter(variant => {
      return Object.entries(selectedAttributes).every(([selectedAttrId, selectedValueId]) => {
        return variant.attrValues?.[selectedAttrId] === selectedValueId;
      });
    });
    
    const valueIds = new Set<number>();
    filteredVariants.forEach(variant => {
      const valueId = variant.attrValues?.[attr.id.toString()];
      if (valueId) valueIds.add(valueId);
    });
    
    return allAttributeValues.data.filter((av: any) => 
      av.attributeId === attr.id && valueIds.has(av.id)
    );
  }, [variants, allAttributeValues, selectedAttributes, attr.id]);

  const currentSelection = selectedAttributes[attr.id.toString()];

  if (availableValues.length === 0) return null;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        {attr.name}
      </label>
      <div className="flex flex-wrap gap-2">
        {availableValues.map((av: any) => {
          const isSelected = currentSelection === av.id;
          return (
            <button
              key={av.id}
              onClick={() => onSelect(attr.id.toString(), av.id)}
              className={`
                px-4 py-2 rounded-lg border transition-all duration-200
                text-sm font-medium
                ${isSelected 
                  ? 'border-blue-500 bg-blue-500 text-white shadow-md' 
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                }
              `}
            >
              {av.value}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Promotion Display Component (Từ code cũ)
const PromotionDisplay = ({ 
  promotion, 
  originalPrice,
  selectedVariant
}: { 
  promotion: any; 
  originalPrice: number;
  selectedVariant: ProductVariant | null;
}) => {
  if (!promotion) return null;

  const basePrice = selectedVariant?.priceDelta || originalPrice;
  const now = new Date();
  const startTime = new Date(promotion.startTime);
  const endTime = new Date(promotion.endTime);
  
  // Kiểm tra promotion có đang active không
  const isActive = promotion.status === 'ACTIVE' && startTime <= now && endTime >= now;
  
  if (!isActive) return null;

  const calculateDiscountedPrice = () => {
    if (promotion.discountType === "PERCENT") {
      return basePrice * (1 - (promotion.discountValue || 0) / 100);
    } else if (promotion.discountType === "FIXED") {
      return Math.max(0, basePrice - (promotion.discountValue || 0));
    }
    return basePrice;
  };

  const discountedPrice = calculateDiscountedPrice();
  const savedAmount = basePrice - discountedPrice;

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
          <Zap size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-lg text-gray-800">
            {promotion.name}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={14} />
            <span>Còn lại: {Math.ceil((endTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} ngày</span>
          </div>
        </div>
      </div>
      
    
  
    </div>
  );
};

// Gift Display Component (Từ code cũ)
const GiftDisplay = ({ giftProduct, giftQuantity }: { 
  giftProduct: any; 
  giftQuantity: number;
}) => {
  if (!giftProduct) return null;

  return (
    <div className="mb-4 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-xl p-5 border-2 border-pink-200 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎁</span>
        <span className="font-bold text-lg bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Quà tặng kèm
        </span>
        <span className="ml-auto bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          MIỄN PHÍ
        </span>
      </div>
      <div className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm">
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-pink-200 shadow-sm">
          <img 
            src={getImageUrl(giftProduct.thumb) || ''}
            alt={giftProduct.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-bl-lg">
            x{giftQuantity}
          </div>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-800 mb-1">
            {giftProduct.name}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 line-through">
              {formatVND(giftProduct.basePrice)}
            </span>
            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
              Tặng {giftQuantity} sản phẩm
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 text-center text-sm text-gray-600 bg-white/50 rounded-lg py-2 px-3">
        💝 Tự động thêm vào đơn hàng khi mua sản phẩm này
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
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);

  // Data fetching
  const { 
    data: product, 
    isLoading: loadingProduct, 
    isError 
  } = useProductBySlug({ slug: slug as string });

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

  // Reset quantity khi đổi sản phẩm hoặc variant
  useEffect(() => {
    setQuantity(1);
  }, [productId, selectedVariant]);

  // Calculate main image
  const calculatedMainImage = useMemo(() => {
    if (selectedVariant?.thumb) {
      return getImageUrl(selectedVariant.thumb);
    }
    return getImageUrl(product?.thumb ?? null);
  }, [selectedVariant, product]);

  useEffect(() => {
    setMainImage(calculatedMainImage);
  }, [calculatedMainImage]);

  // Tìm khuyến mãi active
  const activePromotion = useMemo(() => {
    if (!product?.promotionProducts || product.promotionProducts.length === 0) return null;
    
    const now = new Date();
    const activePromo = product.promotionProducts.find((pp: any) => {
      const promo = pp.promotion;
      return promo && 
             promo.status === 'ACTIVE' && 
             new Date(promo.startTime) <= now && 
             new Date(promo.endTime) >= now;
    });
    
    return activePromo;
  }, [product]);

  // Lấy gift product từ khuyến mãi
  const giftProduct = useMemo(() => {
    if (!activePromotion) return null;
    return activePromotion.giftProduct;
  }, [activePromotion]);

  const giftQuantity = activePromotion?.giftQuantity || 1;


// Price calculations
const { originalPrice, finalPrice, discountInfo } = useMemo(() => {
  if (!product) return { originalPrice: 0, finalPrice: 0, discountInfo: null };

  const basePrice = selectedVariant?.priceDelta || product.basePrice;

  // Nếu có khuyến mãi active
  if (activePromotion) {
    // Sử dụng discountType và discountValue từ activePromotion (PromotionProduct)
    let discountedPrice = basePrice;
    
    if (activePromotion.discountType === "PERCENT") {
      discountedPrice = basePrice * (1 - (activePromotion.discountValue || 0) / 100);
    } else if (activePromotion.discountType === "FIXED") {
      discountedPrice = Math.max(0, basePrice - (activePromotion.discountValue || 0));
    }

    return {
      originalPrice: basePrice,
      finalPrice: Math.round(discountedPrice),
      discountInfo: {
        type: activePromotion.discountType,  // Lấy từ activePromotion
        value: activePromotion.discountValue, // Lấy từ activePromotion
        saved: basePrice - discountedPrice
      }
    };
  }

  return { originalPrice: basePrice, finalPrice: basePrice, discountInfo: null };
}, [product, selectedVariant, activePromotion]);

  // Rating
  const avgRating = useMemo(() => {
    if (!product || product.totalReviews === 0) return 0;
    return Math.round((product.totalRatings / product.totalReviews) * 10) / 10;
  }, [product]);

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
      { productVariantId: selectedVariant.id, quantity },
      {
        onOptimisticSuccess: () => {
          setTimeout(() => setIsAdding(false), 300);
        },
        onError: () => setIsAdding(false),
      }
    );
  }, [selectedVariant, product, isAuthenticated, isAdding, addToCart, quantity]);

  const handleBuyNow = useCallback(() => {
    if (!selectedVariant || !product || !isAuthenticated) {
      if (!isAuthenticated) setIsLoginModalOpen(true);
      return;
    }

    addToCart(
      { productVariantId: selectedVariant.id, quantity },
      {
        onOptimisticSuccess: () => {
          message.success(`Đã thêm ${quantity} sản phẩm vào giỏ!`);
          router.push("/dat-hang");
        },
      }
    );
  }, [selectedVariant, product, isAuthenticated, addToCart, router, quantity]);

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

  const handleThumbnailClick = useCallback((imageUrl: string) => {
    setMainImage(imageUrl);
  }, []);

  // Reset selection when product changes
  useEffect(() => {
    setSelectedAttributes({});
    setSelectedVariant(null);
    if (product?.thumb) {
      setMainImage(getImageUrl(product.thumb));
    }
  }, [productId, product]);

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
      <MobileBreadcrumb 
        categoryName={categoryName}
        productName={product.name}
        categoryId={product.categoryId ?? undefined}
      />

      <DesktopBreadcrumb 
        categoryName={categoryName}
        productName={product.name}
        categoryId={product.categoryId ?? undefined}
      />

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-0 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Images */}
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

          {/* Product Info */}
          <div className="space-y-4 lg:space-y-6">
            {/* Mobile name + rating */}
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

            <div className="flex items-center gap-2 flex-wrap">
              {brandName && (
                <Tag color="blue" className="px-4 py-1 text-sm font-medium rounded-full">
                  {brandName}
                </Tag>
              )}
              {categoryName && (
                <Tag color="purple" className="px-4 py-1 text-sm font-medium rounded-full">
                  {categoryName}
                </Tag>
              )}
              <Tag color="green" className="px-4 py-1 text-sm font-medium rounded-full">
                Còn hàng
              </Tag>
            </div>

            <Title level={1} className="hidden lg:block !text-3xl !font-bold !text-gray-900 !mb-2">
              {product.name}
            </Title>

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

            {/* Khuyến mãi từ code cũ */}
            {activePromotion && (
              <PromotionDisplay 
                promotion={activePromotion.promotion}
                originalPrice={originalPrice}
                selectedVariant={selectedVariant}
              />
            )}

            {/* Quà tặng từ code cũ */}
            {giftProduct && (
              <GiftDisplay 
                giftProduct={giftProduct}
                giftQuantity={giftQuantity}
              />
            )}

            <div className="bg-gray-50 rounded-xl lg:rounded-2xl space-y-2 p-4">
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

            {/* Attribute Selection + Reset Button */}
            {availableAttributes.length > 0 && (
              <div className="space-y-6">
                {availableAttributes.map((attr: any) => (
                  <AttributeSelection
                    key={attr.id}
                    attr={attr}
                    variants={variants || []}
                    allAttributeValues={allAttributeValues}
                    selectedAttributes={selectedAttributes}
                    onSelect={handleAttributeSelect}
                  />
                ))}

                {/* Nút Chọn lại */}
                {Object.keys(selectedAttributes).length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedAttributes({});
                        setSelectedVariant(null);
                      }}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      <RotateCcw size={16} />
                      <span>Chọn lại thuộc tính</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quantity + Action Buttons */}
            <div className="lg:space-y-4 pt-4">
              {/* Quantity Selector */}
              {selectedVariant && (
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-4">
                  <span className="text-sm font-medium text-gray-700">Số lượng</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <span className="w-12 text-center font-semibold text-gray-900">
                      {quantity}
                    </span>
                    
                    <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Desktop buttons */}
              <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || isAdding}
                  loading={isAdding}
                  className="!h-14 !rounded-xl !font-semibold !text-base !bg-gradient-to-r !from-blue-600 !to-blue-700 hover:!from-blue-700 hover:!to-blue-800 !border-0 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  {isAdding ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-white font-semibold">Đang thêm...</span>
                    </>
                  ) : (
                    <>
                    
                      <span className="text-white font-semibold">Thêm vào giỏ</span>
                    </>
                  )}
                </Button>
                
                <Button
                  size="large"
                  onClick={handleBuyNow}
                  disabled={!selectedVariant}
                  className="!h-14 !rounded-xl !font-semibold !text-base !bg-gradient-to-r !from-orange-500 !to-red-500 hover:!from-orange-600 hover:!to-red-600 !text-white !border-0 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  <span>Mua ngay</span>
                </Button>
              </div>

              {/* Mobile buttons */}
              <div className="lg:hidden grid grid-cols-2 gap-3">
                <Button
                  type="primary"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || isAdding}
                  loading={isAdding}
                  className="!h-12 !rounded-lg !font-medium flex items-center justify-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Đang thêm...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      <span className="text-sm">Thêm</span>
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleBuyNow}
                  disabled={!selectedVariant}
                  className="!h-12 !rounded-lg !font-medium !bg-gradient-to-r !from-orange-500 !to-red-500 !text-white !border-0 flex items-center justify-center gap-2"
                >
                  <Zap size={16} />
                  <span className="text-sm">Mua ngay</span>
                </Button>
              </div>

              {/* Thông báo khi chưa chọn đủ */}
              {!selectedVariant && Object.keys(selectedAttributes).length > 0 && (
                <div className="text-center py-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-yellow-600 text-lg">⚠️</span>
                    <span className="text-yellow-700 text-sm font-medium">
                      Vui lòng chọn đầy đủ thuộc tính
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Service Features */}
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

        {/* Description */}
        <div className="mt-6 lg:mt-12 bg-white rounded-xl lg:rounded-2xl shadow-sm border overflow-hidden">
          <Tabs
            defaultActiveKey="description"
            size="small"
            className="px-4 lg:px-6 pt-3 lg:pt-4"
            items={[
              {
                key: "description",
                label: <span className="text-sm lg:text-base font-medium">📝 Mô tả sản phẩm</span>,
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

      <MobileStickyHeader
        productName={product.name}
        finalPrice={finalPrice}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isAdding={isAdding}
        hasVariant={!!selectedVariant}
      />

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