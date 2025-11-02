'use client';

import { Table, Button, InputNumber, Image, Modal, message, Card, Empty } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, HomeOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { useRemoveCartItem } from '@/hooks/cart/useRemoveCartItem';
import { useUpdateCartItem } from '@/hooks/cart/useUpdateCartItem';
import { useAllAttributes } from '@/hooks/attribute/useAllAttributes';
import { useAttributeValues } from '@/hooks/attribute-value/useAttributeValues';
import { getImageUrl } from '@/utils/getImageUrl';
import { formatVND } from '@/utils/helpers';
import { useCartStore } from '@/stores/cartStore';
import { useMyCart } from '@/hooks/cart/useMyCart';

const ShoppingCart = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  const {
    items,
    getTotalPrice,
    updateQuantityOptimistic,
    removeItemOptimistic,
    syncFromServer,
  } = useCartStore();

  const removeItemMutation = useRemoveCartItem();
  const updateItemMutation = useUpdateCartItem();

  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: allAttributes } = useAllAttributes();
  const { data: allAttributeValues } = useAttributeValues();

  const { data: cartData, isLoading: cartLoading, error: cartError } = useMyCart();

  useEffect(() => {
    if (cartData?.items) {
      startTransition(() => {
        syncFromServer(cartData.items);
      });
    }
  }, [cartData?.items, syncFromServer]);

  const attributeMap = allAttributes?.reduce((acc: Record<number, string>, attr: any) => {
    acc[attr.id] = attr.name;
    return acc;
  }, {} as Record<number, string>) ?? {};

  const attributeValueMap = allAttributeValues?.data?.reduce((acc: Record<number, string>, val: any) => {
    acc[val.id] = val.value;
    return acc;
  }, {} as Record<number, string>) ?? {};

  // === LOADING & ERROR STATES ===
  if (!mounted || authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-xl">Lỗi tải giỏ hàng: {(cartError as any).message}</p>
        </div>
      </div>
    );
  }

  // === XỬ LÝ XÓA ===
  const handleRemoveItem = (item: any) => {
    startTransition(() => {
      removeItemOptimistic(item.id);
      removeItemMutation.mutate(item.id, {
        onError: () => {
          message.error('Xóa sản phẩm thất bại');
        },
      });
    });
  };

  // === XỬ LÝ SỐ LƯỢNG ===
  const onChangeQuantity = (value: number | null, item: any) => {
    if (!value || value < 1 || value === item.quantity) return;

    startTransition(() => {
      updateQuantityOptimistic(item.productVariantId, value);
      updateItemMutation.mutate(
        { id: item.id, data: { quantity: value } },
        {
          onError: () => {
            message.error('Cập nhật số lượng thất bại');
            updateQuantityOptimistic(item.productVariantId, item.quantity);
          },
        }
      );
    });
  };

  // === ĐI TỚI THANH TOÁN ===
  const handleCheckoutClick = () => {
    if (!currentUser) {
      setIsLoginModalVisible(true);
      return;
    }
    router.push('/dat-hang');
  };

  // === HIỂN THỊ THUỘC TÍNH ===
  const renderAttributes = (attrValues: Record<string, any>) => {
    if (!attrValues || Object.keys(attrValues).length === 0) return 'Không có thuộc tính';
    return Object.entries(attrValues)
      .map(([attrId, valueId]) => {
        const attrName = attributeMap[Number(attrId)] || `ID: ${attrId}`;
        const valueName = attributeValueMap[Number(valueId)] || `ID: ${valueId}`;
        return `${attrName}: ${valueName}`;
      })
      .join(', ');
  };

  // === CỘT BẢNG (Desktop) ===
  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: any, record: any) => {
        const thumb = record.variant?.thumb || record.variant?.product?.thumb;
        return (
          <div className="flex items-center gap-4">
            <Image
              src={getImageUrl(thumb) || '/placeholder.png'}
              alt={record.variant?.product?.name || 'Sản phẩm'}
              width={80}
              height={80}
              style={{ objectFit: 'cover', borderRadius: 12 }}
              preview={false}
              fallback="/placeholder.png"
              className="flex-shrink-0"
            />
            <div>
              <div className="font-semibold text-gray-900 mb-1">
                {record.variant?.product?.name || 'Sản phẩm không xác định'}
              </div>
              <div className="text-sm text-gray-500">
                {renderAttributes(record.variant?.attrValues)}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Đơn giá',
      key: 'price',
      width: 150,
      render: (_: any, r: any) => (
        <span className="font-semibold text-gray-900">{formatVND(r.priceAtAdd)}</span>
      ),
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      width: 180,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          <Button
            size="middle"
            icon={<MinusOutlined />}
            disabled={record.quantity <= 1 || isPending}
            onClick={() => onChangeQuantity(record.quantity - 1, record)}
            className="!rounded-lg"
          />
          <InputNumber
            min={1}
            value={record.quantity}
            onChange={(v) => typeof v === 'number' && onChangeQuantity(v, record)}
            className="!w-16 text-center !rounded-lg"
            controls={false}
            disabled={isPending}
          />
          <Button
            size="middle"
            icon={<PlusOutlined />}
            disabled={isPending}
            onClick={() => onChangeQuantity(record.quantity + 1, record)}
            className="!rounded-lg"
          />
        </div>
      ),
    },
    {
      title: 'Tổng',
      key: 'total',
      width: 150,
      render: (_: any, r: any) => (
        <span className="font-bold text-lg text-blue-600">{formatVND(r.priceAtAdd * r.quantity)}</span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_: any, record: any) => (
        <Button
          danger
          type="text"
          size="large"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record)}
          loading={isPending}
          className="!rounded-lg hover:!bg-red-50"
        />
      ),
    },
  ];

  // === GIỎ HÀNG TRỐNG ===
  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8 flex items-center gap-2 text-gray-600">
            <Link href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              <HomeOutlined />
              <span>Trang chủ</span>
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Giỏ hàng</span>
          </div>

          <Card className="!rounded-3xl !border-2 shadow-lg">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="py-8">
                  <p className="text-xl font-semibold text-gray-700 mb-2">Giỏ hàng của bạn đang trống</p>
                  <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                  <Link href="/">
                    <Button type="primary" size="large" icon={<ShoppingCartOutlined />} className="!rounded-xl">
                      Tiếp tục mua sắm
                    </Button>
                  </Link>
                </div>
              }
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-gray-600">
          <Link href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <HomeOutlined />
            <span>Trang chủ</span>
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Giỏ hàng</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <ShoppingCartOutlined className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Giỏ hàng của bạn
            </h1>
            <p className="text-gray-600">Bạn có {items.length} sản phẩm trong giỏ hàng</p>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <Card className="!rounded-3xl !border-2 shadow-lg overflow-hidden">
            <Table
              dataSource={items}
              columns={columns}
              rowKey="id"
              pagination={false}
              loading={isPending || cartLoading}
              className="modern-cart-table"
            />
          </Card>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {items.map((item: any) => {
            const thumb = item.variant?.thumb || item.variant?.product?.thumb;
            return (
              <Card
                key={item.id}
                className="!rounded-2xl !border-2 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex gap-4">
                  <Image
                    src={getImageUrl(thumb) || '/placeholder.png'}
                    alt={item.variant?.product?.name || 'Sản phẩm'}
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover', borderRadius: 12 }}
                    preview={false}
                    fallback="/placeholder.png"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                      {item.variant?.product?.name || 'Sản phẩm không xác định'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {renderAttributes(item.variant?.attrValues)}
                    </p>
                    <p className="font-semibold text-blue-600 mb-3">{formatVND(item.priceAtAdd)}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="small"
                          icon={<MinusOutlined />}
                          disabled={item.quantity <= 1 || isPending}
                          onClick={() => onChangeQuantity(item.quantity - 1, item)}
                          className="!rounded-lg"
                        />
                        <InputNumber
                          min={1}
                          value={item.quantity}
                          onChange={(v) => typeof v === 'number' && onChangeQuantity(v, item)}
                          className="!w-14 text-center !rounded-lg"
                          controls={false}
                          disabled={isPending}
                          size="small"
                        />
                        <Button
                          size="small"
                          icon={<PlusOutlined />}
                          disabled={isPending}
                          onClick={() => onChangeQuantity(item.quantity + 1, item)}
                          className="!rounded-lg"
                        />
                      </div>
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(item)}
                        loading={isPending}
                        className="!rounded-lg"
                      />
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tổng:</span>
                        <span className="font-bold text-lg text-blue-600">
                          {formatVND(item.priceAtAdd * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Summary & Checkout */}
        <Card className="mt-6 !rounded-3xl !border-2 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-gray-600 mb-1">Tổng cộng</p>
              <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatVND(getTotalPrice())}
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              onClick={handleCheckoutClick}
              disabled={isPending}
              className="!h-14 !px-8 !rounded-xl !text-base font-bold !bg-gradient-to-r !from-blue-500 !to-purple-500 hover:!from-blue-600 hover:!to-purple-600 !border-0 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
            >
              Đặt hàng ngay
            </Button>
          </div>
        </Card>
      </div>

      {/* Modal đăng nhập */}
      <Modal
        title={<span className="text-xl font-bold">Yêu cầu đăng nhập</span>}
        open={isLoginModalVisible}
        onOk={() => router.push(`/login?returnUrl=${encodeURIComponent('/gio-hang')}`)}
        onCancel={() => setIsLoginModalVisible(false)}
        okText="Đăng nhập"
        cancelText="Hủy"
        centered
        className="modern-modal"
      >
        <p className="text-gray-600 py-4">Bạn cần đăng nhập để tiến hành thanh toán.</p>
      </Modal>

      <style jsx global>{`
        .modern-cart-table .ant-table-thead > tr > th {
          background: linear-gradient(to right, #f0f9ff, #faf5ff);
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
        }
        .modern-cart-table .ant-table-tbody > tr {
          transition: all 0.3s;
        }
        .modern-cart-table .ant-table-tbody > tr:hover {
          background: #f9fafb;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default ShoppingCart;