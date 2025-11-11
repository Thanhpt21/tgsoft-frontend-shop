"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Button,
  Typography,
  Space,
  Breadcrumb,
  Tabs,
  message,
  Modal,
  Tag,
  Rate,
} from "antd";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import ProductImageGallery from "@/components/layout/product/ProductImageGallery";
import { useProductBySlug } from "@/hooks/product/useProductBySlug";
import { useProductVariants } from "@/hooks/product-variant/useProductVariants";
import { useAddCartItemWithOptimistic } from "@/hooks/cart/useAddCartItemWithOptimistic";
import { getImageUrl } from "@/utils/getImageUrl";
import { Product } from "@/types/product.type";
import { ProductVariant } from "@/types/product-variant.type";
import { useAllAttributes } from "@/hooks/attribute/useAllAttributes";
import { useAttributeValues } from "@/hooks/attribute-value/useAttributeValues";
import { Attribute } from "@/types/attribute.type";
import { useAllCategories } from "@/hooks/category/useAllCategories";
import { useAllBrands } from "@/hooks/brand/useAllBrands";
import RatingComponent from "@/components/layout/rating/RatingComponent";

const { Title, Text, Paragraph } = Typography;

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const {
    data: product,
    isLoading: loadingProduct,
    isError,
  } = useProductBySlug({ slug: slug as string });
  const productId = product?.id;
  const { data: variants } = useProductVariants(productId);
  const addToCart = useAddCartItemWithOptimistic();
  const [isAdding, setIsAdding] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, number>
  >({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  const { data: allAttributes } = useAllAttributes();
  const { data: allAttributeValues } = useAttributeValues();
  const { data: allCategories } = useAllCategories();
  const { data: allBrands } = useAllBrands();

  // useMemo: attributeMap
  const attributeMap = useMemo(() => {
    return (
      allAttributes?.reduce((acc: Record<number, string>, attr: Attribute) => {
        acc[attr.id] = attr.name;
        return acc;
      }, {} as Record<number, string>) ?? {}
    );
  }, [allAttributes]);

  // useMemo: attributeValueMap
  const attributeValueMap = useMemo(() => {
    return (
      allAttributeValues?.data.reduce((acc: Record<number, string>, val) => {
        acc[val.id] = val.value;
        return acc;
      }, {} as Record<number, string>) ?? {}
    );
  }, [allAttributeValues?.data]);

  // useMemo: categoryName
  const categoryName = useMemo(() => {
    return allCategories?.find((cat: any) => cat.id === currentProduct?.categoryId)?.name;
  }, [allCategories, currentProduct?.categoryId]);

  // useMemo: brandName
  const brandName = useMemo(() => {
    return allBrands?.find((brand: any) => brand.id === currentProduct?.brandId)?.name;
  }, [allBrands, currentProduct?.brandId]);

  // useMemo: images
  const images = useMemo(() => {
    if (!currentProduct?.images?.length) {
      return currentProduct?.thumb ? [currentProduct.thumb] : [];
    }
    return [currentProduct.thumb, ...currentProduct.images].filter(Boolean);
  }, [currentProduct?.thumb, currentProduct?.images]);

  // useMemo: attributeOptions
  const attributeOptions = useMemo(() => {
    const options: Record<number, Set<number>> = {};
    variants?.forEach((v) => {
      Object.entries(v.attrValues).forEach(([attrId, valueId]) => {
        const numAttrId = Number(attrId);
        if (!options[numAttrId]) options[numAttrId] = new Set();
        options[numAttrId].add(valueId as number);
      });
    });
    return options;
  }, [variants]);

  // useMemo: finalPrice, originalPrice, discountedPrice
  const { finalPrice, originalPrice, discountedPrice } = useMemo(() => {
    if (!currentProduct || !selectedVariant) {
      const base = currentProduct?.basePrice ?? 0;
      return { finalPrice: base, originalPrice: base, discountedPrice: null };
    }

    const basePrice = selectedVariant.priceDelta;
    const promo = currentProduct.promotionProducts?.[0];

    let discounted = null;
    if (promo) {
      if (promo.discountType === "PERCENT") {
        discounted = basePrice * (1 - promo.discountValue / 100);
      } else if (promo.discountType === "FIXED") {
        discounted = Math.max(0, basePrice - promo.discountValue);
      }
    }

    const final = discounted ?? basePrice;
    return {
      finalPrice: final,
      originalPrice: basePrice,
      discountedPrice: discounted,
    };
  }, [currentProduct, selectedVariant]);

  // useEffect: set currentProduct & mainImage
  useEffect(() => {
    if (product && !currentProduct) {
      const thumbUrl = getImageUrl(product.thumb ?? null);
      setCurrentProduct({
        ...product,
        thumb: thumbUrl,
      });
      setMainImage(thumbUrl);
    }
  }, [product, currentProduct]);

  // useEffect: update selectedVariant & mainImage
  useEffect(() => {
    if (!variants) return;

    const matched = variants.find((v) => {
      return Object.entries(v.attrValues).every(([attrId, valueId]) => {
        return selectedAttributes[attrId] === valueId;
      });
    });

    setSelectedVariant(matched ?? null);

    if (matched && matched.thumb) {
      setMainImage(getImageUrl(matched.thumb));
    } else if (product) {
      setMainImage(getImageUrl(product.thumb ?? null));
    }
  }, [selectedAttributes, variants, product]);

  const handleThumbnailClick = useCallback((img: string) => {
    setMainImage(img);
  }, []);

  const handleAttributeChange = useCallback((attrId: string, value: number) => {
    setSelectedAttributes((prev) => ({ ...prev, [attrId]: value }));
  }, []);

  const handleResetAttributes = useCallback(() => {
    setSelectedAttributes({});
    setSelectedVariant(null);
    if (product) {
      setMainImage(getImageUrl(product.thumb ?? null));
    }
  }, [product]);

  const handleAddToCart = useCallback(() => {
    if (!selectedVariant || !product || !isAuthenticated) {
      if (!isAuthenticated) setIsLoginModalOpen(true);
      return;
    }

    if (isAdding) return;
    setIsAdding(true);

    const attributes = Object.fromEntries(
      Object.entries(selectedVariant.attrValues).map(([attrId, valueId]) => [
        attributeMap[Number(attrId)] || attrId,
        attributeValueMap[valueId] || valueId,
      ])
    );

    addToCart(
      { productVariantId: selectedVariant.id, quantity: 1 },
      {
        onOptimisticSuccess: () => {
          message.success("Đã thêm vào giỏ hàng!");
          setTimeout(() => setIsAdding(false), 300);
        },
        onError: () => {
          setIsAdding(false);
        },
      }
    );
  }, [
    selectedVariant,
    product,
    isAuthenticated,
    isAdding,
    addToCart,
    attributeMap,
    attributeValueMap,
  ]);

  const handleBuyNow = useCallback(() => {
    if (!selectedVariant || !product || !isAuthenticated) {
      if (!isAuthenticated) setIsLoginModalOpen(true);
      return;
    }

    const attributes = Object.fromEntries(
      Object.entries(selectedVariant.attrValues).map(([attrId, valueId]) => [
        attributeMap[Number(attrId)] || attrId,
        attributeValueMap[valueId] || valueId,
      ])
    );

    addToCart(
      { productVariantId: selectedVariant.id, quantity: 1 },
      {
        onOptimisticSuccess: () => {
          message.success("Đã thêm vào giỏ!");
          router.push("/dat-hang");
        },
      }
    );
  }, [
    selectedVariant,
    product,
    isAuthenticated,
    addToCart,
    attributeMap,
    attributeValueMap,
    router,
  ]);

  const handleLoginModalOk = useCallback(() => {
    setIsLoginModalOpen(false);
    const currentPath = window.location.pathname;
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  }, [router]);

  const handleLoginModalCancel = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  // Loading & Error
  if (loadingProduct || !currentProduct || !mainImage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-300 mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">
            Đang tải sản phẩm...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">Lỗi</div>
          <p className="text-xl text-red-600 font-semibold">
            Lỗi khi tải sản phẩm
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-2 py-3 md:px-3 lg:px-4 max-w-[1400px]">
        {/* Modern Breadcrumb */}
        <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50">
          <Breadcrumb className="text-sm">
            <Breadcrumb.Item>
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                🏠 Trang chủ
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link
                href="/san-pham"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                🛍️ Sản phẩm
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span className="text-blue-600 font-semibold">
                {currentProduct.name}
              </span>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-2 lg:gap-3 mb-4 max-w-[1400px] mx-auto">
          {/* Image Gallery */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 lg:p-4 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300">
            <ProductImageGallery
              currentData={currentProduct}
              productTitle={currentProduct.name}
              mainImage={mainImage}
              onThumbnailClick={handleThumbnailClick}
            />
          </div>

          {/* Product Info */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 lg:p-4 shadow-xl border border-white/50 space-y-2 lg:space-y-3">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {brandName && (
                <Tag
                  color="blue"
                  className="px-4 py-1 text-sm font-medium rounded-full"
                >
                  🏷️ {brandName}
                </Tag>
              )}
              {categoryName && (
                <Tag
                  color="purple"
                  className="px-4 py-1 text-sm font-medium rounded-full"
                >
                  📁 {categoryName}
                </Tag>
              )}
              <Tag
                color="green"
                className="px-4 py-1 text-sm font-medium rounded-full"
              >
                ✨ Mới
              </Tag>
            </div>

            {/* Product Name */}
            <div>
              <Title
                level={2}
                className="!mb-2 !text-3xl !font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                {currentProduct.name}
              </Title>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
            <Rate
              disabled
              allowHalf
              value={currentProduct.totalRatings}
              style={{ fontSize: "15px" }}
              className="text-yellow-400 sm:text-[13px]"
            />
            <span className="text-gray-400 text-[9px] sm:text-xs">
              ({currentProduct.totalReviews} đánh giá)
            </span>
          </div>
            {/* Badge khuyến mãi nổi bật */}
            {currentProduct.promotionProducts &&
            currentProduct.promotionProducts.length > 0 ? (
              <div className="mb-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
                <span className="text-2xl">{currentProduct.promotionProducts[0].promotion.isFlashSale === true ? 'FlashSale' : ''}</span>
                <div className="flex-1">
                  <div className="font-bold text-lg">
                    {currentProduct.promotionProducts[0].promotion.name}
                  </div>
                  <div className="text-sm opacity-90">
                    Kết thúc:{" "}
                    {new Date(
                      currentProduct.promotionProducts[0].promotion.endTime
                    ).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div className="bg-white text-red-600 px-4 py-2 rounded-full font-bold text-lg">
                  -
                  {currentProduct.promotionProducts[0].discountType ===
                  "PERCENT"
                    ? `${currentProduct.promotionProducts[0].discountValue}%`
                    : `${currentProduct.promotionProducts[0].discountValue.toLocaleString()}đ`}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Không có chương trình khuyến mãi
              </div>
            )}

            {/* Quà tặng kèm */}
            {currentProduct.promotionProducts && 
             currentProduct.promotionProducts.length > 0 && 
             currentProduct.promotionProducts[0].giftProduct && (
              <div className="mb-4 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-2xl p-5 border-2 border-pink-200 shadow-md">
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
                      src={getImageUrl(currentProduct.promotionProducts[0].giftProduct.thumb) || ''}
                      alt={currentProduct.promotionProducts[0].giftProduct.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-bl-lg">
                      x{currentProduct.promotionProducts[0].giftQuantity}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">
                      {currentProduct.promotionProducts[0].giftProduct.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 line-through">
                        {currentProduct.promotionProducts[0].giftProduct.basePrice.toLocaleString()}đ
                      </span>
                      <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        Tặng {currentProduct.promotionProducts[0].giftQuantity} sản phẩm
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center text-sm text-gray-600 bg-white/50 rounded-lg py-2 px-3">
                  💝 Tự động thêm vào đơn hàng khi mua sản phẩm này
                </div>
              </div>
            )}

            {/* Price Card với khuyến mãi */}
            {currentProduct.promotionProducts &&
            currentProduct.promotionProducts.length > 0 ? (
              <div className="bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                {/* Badge chương trình khuyến mãi */}
                <div className="absolute top-2 right-2 bg-yellow-400 text-red-800 text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
                  {currentProduct.promotionProducts[0].promotion.name}
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium opacity-90">
                    Giá gốc:
                  </span>
                  <span className="text-lg line-through opacity-70">
                    {originalPrice.toLocaleString()} VNĐ
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-medium opacity-90">
                    Giá khuyến mãi:
                  </span>
                  <span className="text-5xl font-black">
                    {finalPrice.toLocaleString()}
                  </span>
                  <span className="text-xl font-bold">VNĐ</span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-bold">
                    -
                    {currentProduct.promotionProducts[0].discountType ===
                    "PERCENT"
                      ? `${currentProduct.promotionProducts[0].discountValue}%`
                      : `${currentProduct.promotionProducts[0].discountValue.toLocaleString()}đ`}
                  </span>
                  <span className="text-sm opacity-80">
                    Tiết kiệm: {(originalPrice - finalPrice).toLocaleString()}đ
                  </span>
                </div>
              </div>
            ) : (
              /* Giá thường (không có khuyến mãi) */
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-medium opacity-90">
                    Giá bán:
                  </span>
                  <span className="text-4xl font-bold">
                    {finalPrice.toLocaleString()}
                  </span>
                  <span className="text-xl font-medium">VNĐ</span>
                </div>
                {selectedVariant && (
                  <div className="mt-2 text-sm opacity-75">
                    Đã chọn phiên bản
                  </div>
                )}
              </div>
            )}

            {/* Attributes Section */}
            <div className="space-y-6">
              {Object.entries(attributeOptions).map(([attrId, valueSet]) => {
                const attrName =
                  attributeMap[Number(attrId)] ?? `Thuộc tính ${attrId}`;

                const allValuesForAttr =
                  allAttributeValues?.data.filter(
                    (av) => av.attributeId === Number(attrId)
                  ) ?? [];

                return (
                  <div key={attrId} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                      <Text strong className="text-lg text-gray-800">
                        {attrName}
                      </Text>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {allValuesForAttr.map((av) => {
                        const isInVariants = valueSet.has(av.id);

                        const isAvailable =
                          variants?.some((v) => {
                            if (v.attrValues[attrId] !== av.id) return false;
                            return Object.entries(selectedAttributes).every(
                              ([selectedAttrId, selectedValueId]) => {
                                if (selectedAttrId === attrId) return true;
                                return (
                                  v.attrValues[selectedAttrId] ===
                                  selectedValueId
                                );
                              }
                            );
                          }) ?? false;

                        const isSelected = selectedAttributes[attrId] === av.id;

                        return (
                          <button
                            key={av.id}
                            onClick={() =>
                              isAvailable &&
                              handleAttributeChange(attrId, av.id)
                            }
                            disabled={!isAvailable}
                            className={`
                              relative px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105
                              ${
                                isSelected
                                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                                  : isAvailable
                                  ? "bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:shadow-md"
                                  : "bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                              }
                            `}
                          >
                            {!isAvailable && (
                              <span className="absolute inset-0 flex items-center justify-center text-red-500 text-xl font-bold">
                                ×
                              </span>
                            )}
                            <span className={!isAvailable ? "opacity-30" : ""}>
                              {av.value}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reset Button */}
            {Object.keys(selectedAttributes).length > 0 && (
              <div className="pt-2">
                <Button
                  onClick={handleResetAttributes}
                  className="!bg-gray-100 hover:!bg-gray-200 !border-0 !text-gray-700 !rounded-xl !px-6 !py-2 !h-auto font-medium transition-all duration-300 hover:scale-105"
                >
                  🔄 Chọn lại tất cả
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="primary"
                size="large"
                onClick={handleAddToCart}
                disabled={!selectedVariant || isAdding}
                className="!h-14 !rounded-xl !text-lg font-semibold !bg-gradient-to-r !from-blue-600 !to-blue-700 hover:!from-blue-700 hover:!to-blue-800 !border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:!opacity-50 disabled:!cursor-not-allowed disabled:hover:!scale-100"
              >
                {isAdding ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
                    Đang thêm...
                  </span>
                ) : (
                  "🛒 Thêm vào giỏ hàng"
                )}
              </Button>
              <Button
                size="large"
                onClick={handleBuyNow}
                disabled={!selectedVariant}
                className="!h-14 !rounded-xl !text-lg font-semibold !bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !text-white !border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:!opacity-50 disabled:!cursor-not-allowed disabled:hover:!scale-100"
              >
                ⚡ Mua ngay
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200">
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-2xl mb-1">✅</div>
                <div className="text-xs font-medium text-gray-700">
                  Hàng chính hãng
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <div className="text-2xl mb-1">🚚</div>
                <div className="text-xs font-medium text-gray-700">
                  Giao hàng nhanh
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <div className="text-2xl mb-1">🔄</div>
                <div className="text-xs font-medium text-gray-700">
                  Đổi trả 7 ngày
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Modal */}
        <Modal
          open={isLoginModalOpen}
          onOk={handleLoginModalOk}
          onCancel={handleLoginModalCancel}
          okText="Đăng nhập ngay"
          cancelText="Để sau"
          centered
        >
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🔐</div>
            <Title level={3} className="!mb-4">
              Đăng nhập để tiếp tục
            </Title>
            <p className="text-lg mb-6 text-gray-600">
              Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Sản phẩm đã chọn:</p>
              <p className="font-bold text-lg text-gray-800 mb-2">
                {product?.name}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {(
                  selectedVariant?.priceDelta || product?.basePrice
                )?.toLocaleString()}{" "}
                VNĐ
              </p>
            </div>
          </div>
        </Modal>

        {/* Details Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50 mb-4">
          <Tabs
            defaultActiveKey="description"
            size="large"
            items={[
              {
                key: "description",
                label: <span className="font-semibold">📝 Mô tả sản phẩm</span>,
                children: (
                  <div className="prose max-w-none p-6">
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          currentProduct.description ||
                          '<p class="text-gray-500 text-center py-8">Chưa có mô tả chi tiết cho sản phẩm này.</p>',
                      }}
                      className="text-gray-700 leading-relaxed"
                    />
                  </div>
                ),
              },
              {
                key: "policy",
                label: <span className="font-semibold">📋 Chính sách</span>,
                children: (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                      <Title
                        level={4}
                        className="!mb-3 flex items-center gap-2"
                      >
                        <span className="text-2xl">🚚</span>
                        Chính sách vận chuyển
                      </Title>
                      <Paragraph className="!mb-0 text-gray-700">
                        Giao hàng nhanh chóng và an toàn, từ 2-5 ngày làm việc.
                        Miễn phí vận chuyển cho đơn hàng trên 500.000đ.
                      </Paragraph>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                      <Title
                        level={4}
                        className="!mb-3 flex items-center gap-2"
                      >
                        <span className="text-2xl">🔄</span>
                        Chính sách đổi trả
                      </Title>
                      <Paragraph className="!mb-0 text-gray-700">
                        Hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm lỗi hoặc
                        không đúng mô tả. Sản phẩm phải còn nguyên vẹn và chưa
                        qua sử dụng.
                      </Paragraph>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                      <Title
                        level={4}
                        className="!mb-3 flex items-center gap-2"
                      >
                        <span className="text-2xl">🛡️</span>
                        Chính sách bảo hành
                      </Title>
                      <Paragraph className="!mb-0 text-gray-700">
                        Sản phẩm được bảo hành chính hãng theo quy định của nhà
                        sản xuất. Chi tiết vui lòng liên hệ CSKH để được hỗ trợ.
                      </Paragraph>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Rating Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white/50">
          <Title level={3} className="!mb-6 flex items-center gap-3">
            <span className="text-3xl">⭐</span>
            Đánh giá sản phẩm
          </Title>
          {productId && <RatingComponent productId={productId} />}
        </div>
      </div>
    </div>
  );
}
