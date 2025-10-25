'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter  } from 'next/navigation';
import { Card, Button, Typography, Space, Breadcrumb, Tabs, message, Modal } from 'antd';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

import ProductImageGallery from '@/components/layout/product/ProductImageGallery';
import { useProductBySlug } from '@/hooks/product/useProductBySlug';
import { useProductVariants } from '@/hooks/product-variant/useProductVariants';
import { useAddCartItem } from '@/hooks/cart/useAddCartItem';
import { getImageUrl } from '@/utils/getImageUrl';
import { Product } from '@/types/product.type';
import { ProductVariant } from '@/types/product-variant.type';
import { useAllAttributes } from '@/hooks/attribute/useAllAttributes';
import { useAttributeValues } from '@/hooks/attribute-value/useAttributeValues';
import { Attribute } from '@/types/attribute.type';
import { useAllCategories } from '@/hooks/category/useAllCategories';
import { useAllBrands } from '@/hooks/brand/useAllBrands';

const { Title, Text, Paragraph } = Typography;

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  // ✅ Auth hook
  const { currentUser, isAuthenticated } = useAuth();

  const { data: product, isLoading: loadingProduct, isError } = useProductBySlug({ slug: slug as string });
  const productId = product?.id;
  const { data: variants } = useProductVariants(productId ?? 0);
  const addCartItemMutation = useAddCartItem();

  // ✅ Modal login state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, number>>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Lấy tất cả attribute
  const { data: allAttributes } = useAllAttributes();

  // Lấy tất cả giá trị attribute
  const { data: allAttributeValues } = useAttributeValues();

  // Lấy tất cả categories và brands
  const { data: allCategories } = useAllCategories();
  const { data: allBrands } = useAllBrands();

  // Map id -> name cho attribute
  const attributeMap = allAttributes?.reduce((acc: Record<number, string>, attr: Attribute) => {
    acc[attr.id] = attr.name;
    return acc;
  }, {} as Record<number, string>) ?? {}

  // Map id -> value cho attribute value
  const attributeValueMap = allAttributeValues?.data.reduce((acc: Record<number, string>, val) => {
    acc[val.id] = val.value;
    return acc;
  }, {} as Record<number, string>) ?? {};

  // Tìm tên category và brand
  const categoryName = allCategories?.find((cat: any) => cat.id === currentProduct?.categoryId)?.name;
  const brandName = allBrands?.find((brand: any) => brand.id === currentProduct?.brandId)?.name;

  // Set current product + main image
  useEffect(() => {
    if (product && !currentProduct) {
      setCurrentProduct({
        ...product,
        thumb: getImageUrl(product.thumb ?? null),
      });
      setMainImage(getImageUrl(product.thumb ?? null));
    }
  }, [product, currentProduct]);

  // Khi selectedAttributes thay đổi, tìm variant tương ứng
  useEffect(() => {
    if (!variants) return;

    const matched = variants.find((v) => {
      return Object.entries(v.attrValues).every(([attrId, valueId]) => {
        return selectedAttributes[attrId] === valueId;
      });
    });

    setSelectedVariant(matched ?? null);
    
    // Nếu tìm thấy variant và variant có ảnh, đổi mainImage
    if (matched && matched.thumb) {
      setMainImage(getImageUrl(matched.thumb));
    } else if (product) {
      // Nếu không có variant hoặc variant không có ảnh, về ảnh gốc
      setMainImage(getImageUrl(product.thumb ?? null));
    }
  }, [selectedAttributes, variants, product]);

  const handleThumbnailClick = (img: string) => setMainImage(img);

  const handleAttributeChange = (attrId: string, value: number) => {
    setSelectedAttributes((prev) => ({ ...prev, [attrId]: value }));
  };

  const handleResetAttributes = () => {
    setSelectedAttributes({});
    setSelectedVariant(null);
    // Reset về ảnh sản phẩm gốc
    if (product) {
      setMainImage(getImageUrl(product.thumb ?? null));
    }
  };

  // ✅ Kiểm tra login trước khi thêm vào giỏ
  const handleAddToCart = () => {
    if (!selectedVariant) return message.error('Vui lòng chọn đầy đủ thuộc tính!');
    
    if (!isAuthenticated) {
      // ✅ Chưa login → hiện modal
      setIsLoginModalOpen(true);
      return;
    }

    // ✅ Đã login → thêm bình thường
    addCartItemMutation.mutate(
      { productVariantId: selectedVariant.id, quantity: 1 },
      { onSuccess: () => message.success('Đã thêm vào giỏ hàng!') }
    );
  };

  // ✅ Tương tự cho Buy Now
  const handleBuyNow = () => {
    if (!selectedVariant) return message.error('Vui lòng chọn đầy đủ thuộc tính!');
    
    if (!isAuthenticated) {
      // ✅ Chưa login → hiện modal
      setIsLoginModalOpen(true);
      return;
    }

    // ✅ Đã login → thêm và chuyển trang
    addCartItemMutation.mutate(
      { productVariantId: selectedVariant.id, quantity: 1 },
      {
        onSuccess: () => {
          message.success('Đã thêm vào giỏ hàng!');
          router.push('/dat-hang');
        },
      }
    );
  };

  // ✅ Xử lý modal login - chuyển đến trang login với redirect URL
  const handleLoginModalOk = () => {
    setIsLoginModalOpen(false);
    // Lưu URL hiện tại vào query parameter
    const currentPath = window.location.pathname;
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleLoginModalCancel = () => {
    setIsLoginModalOpen(false);
  };

  if (loadingProduct || !currentProduct || !mainImage)
    return <div className="text-center py-5">Đang tải...</div>;
  if (isError || !product)
    return <div className="text-center py-5 text-red-500">Lỗi khi tải sản phẩm.</div>;

  const images = currentProduct.images
    ? [currentProduct.thumb, ...currentProduct.images].filter(Boolean)
    : [currentProduct.thumb];

  // Tạo tập hợp giá trị của từng attribute từ variants
  const attributeOptions: Record<number, Set<number>> = {};
  variants?.forEach((v) => {
    Object.entries(v.attrValues).forEach(([attrId, valueId]) => {
      const numAttrId = Number(attrId);
      if (!attributeOptions[numAttrId]) attributeOptions[numAttrId] = new Set();
      attributeOptions[numAttrId].add(valueId as number);
    });
  });

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item><Link href="/">Trang chủ</Link></Breadcrumb.Item>
        <Breadcrumb.Item><Link href="/san-pham">Sản phẩm</Link></Breadcrumb.Item>
        <Breadcrumb.Item>{currentProduct.name}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProductImageGallery
          currentData={currentProduct}
          productTitle={currentProduct.name}
          mainImage={mainImage}
          onThumbnailClick={handleThumbnailClick}
        />

        <div>
          <Title level={2}>{currentProduct.name}</Title>
          <Text type="secondary" className="block mb-4">
            {brandName && <span>{brandName}</span>}
            {brandName && categoryName && <span> - </span>}
            {categoryName && <span>{categoryName}</span>}
          </Text>

          <Title level={4} className="mb-4 text-gray-600">
            Giá: {selectedVariant ? selectedVariant.priceDelta.toLocaleString() : currentProduct.basePrice.toLocaleString()} VNĐ
          </Title>

          {/* Render các thuộc tính */}
          {Object.entries(attributeOptions).map(([attrId, valueSet]) => {
            const attrName = attributeMap[Number(attrId)] ?? `Thuộc tính ${attrId}`;
            
            // Lấy tất cả giá trị của thuộc tính này
            const allValuesForAttr = allAttributeValues?.data.filter(
              av => av.attributeId === Number(attrId)
            ) ?? [];
            
            return (
              <div key={attrId} className="mb-6">
                <Text strong className="block mb-3">{attrName}:</Text>
                <div className="flex flex-wrap gap-2">
                  {allValuesForAttr.map((av) => {
                    // Kiểm tra xem giá trị này có trong variants không
                    const isInVariants = valueSet.has(av.id);
                    
                    // Kiểm tra xem có tồn tại variant với tổ hợp hiện tại + giá trị này không
                    const isAvailable = variants?.some((v) => {
                      // Kiểm tra giá trị này có trong variant không
                      if (v.attrValues[attrId] !== av.id) return false;
                      
                      // Kiểm tra tất cả các thuộc tính đã chọn khác có khớp không
                      return Object.entries(selectedAttributes).every(([selectedAttrId, selectedValueId]) => {
                        // Bỏ qua thuộc tính hiện tại
                        if (selectedAttrId === attrId) return true;
                        // Kiểm tra thuộc tính đã chọn có khớp với variant không
                        return v.attrValues[selectedAttrId] === selectedValueId;
                      });
                    }) ?? false;
                    
                    const isSelected = selectedAttributes[attrId] === av.id;
                    
                    return (
                      <button
                        key={av.id}
                        onClick={() => isAvailable && handleAttributeChange(attrId, av.id)}
                        disabled={!isAvailable}
                        className={`
                          px-4 py-2 border-2 rounded-lg transition-all duration-200
                          ${isSelected 
                            ? 'border-blue-500 bg-blue-500 text-white' 
                            : isAvailable
                              ? 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
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
          })}

          {/* Nút Reset */}
          {Object.keys(selectedAttributes).length > 0 && (
            <div className="mb-4">
              <Button 
                size="small" 
                onClick={handleResetAttributes}
                className="text-gray-500 hover:text-blue-500"
              >
                🔄 Chọn lại thuộc tính
              </Button>
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <Button 
              type="primary" 
              size="large" 
              onClick={handleAddToCart}
              loading={addCartItemMutation.isPending}
              disabled={!selectedVariant}
            >
              Thêm vào giỏ hàng
            </Button>
            <Button 
              type="default" 
              size="large" 
              onClick={handleBuyNow}
              loading={addCartItemMutation.isPending}
              disabled={!selectedVariant}
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>

      {/* ✅ Modal đăng nhập */}
      <Modal
        title="Đăng nhập để mua hàng"
        open={isLoginModalOpen}
        onOk={handleLoginModalOk}
        onCancel={handleLoginModalCancel}
        okText="Đi đến đăng nhập"
        cancelText="Hủy"
      >
        <div className="text-center py-4">
          <p className="text-lg mb-4">
            Vui lòng <strong>đăng nhập</strong> để thêm sản phẩm vào giỏ hàng!
          </p>
          <div className="text-gray-600">
            <p>Sản phẩm: <strong>{product?.name}</strong></p>
            <p>Giá: <strong>{(selectedVariant?.priceDelta || product?.basePrice)?.toLocaleString()} VNĐ</strong></p>
          </div>
        </div>
      </Modal>

      <div className="mt-10">
        <Tabs defaultActiveKey="description" size="large">
          <Tabs.TabPane tab="Mô tả" key="description">
            <div dangerouslySetInnerHTML={{ __html: currentProduct.description || 'Không có mô tả.' }} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Chính sách" key="policy">
            <Title level={4} className="mb-4">Chính sách vận chuyển</Title>
            <Paragraph>Giao hàng nhanh chóng và an toàn, từ 2-5 ngày làm việc.</Paragraph>
            <Title level={4} className="mt-6 mb-4">Chính sách đổi trả</Title>
            <Paragraph>Hỗ trợ đổi trả 7 ngày nếu sản phẩm lỗi hoặc không đúng mô tả.</Paragraph>
            <Title level={4} className="mt-6 mb-4">Chính sách bảo hành</Title>
            <Paragraph>Sản phẩm được bảo hành chính hãng, chi tiết liên hệ CSKH.</Paragraph>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
}