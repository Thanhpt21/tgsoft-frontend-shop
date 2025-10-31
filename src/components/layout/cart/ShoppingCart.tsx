'use client';

import { Table, Button, InputNumber, Image, Breadcrumb, Modal, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
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

  const { data: allAttributes } = useAllAttributes();
  const { data: allAttributeValues } = useAttributeValues();

  // Dùng useMyCart thay fetch thủ công
  const { data: cartData, isLoading: cartLoading, error: cartError } = useMyCart();

  // Đồng bộ dữ liệu từ server vào store
  useEffect(() => {
    if (cartData?.items) {
      startTransition(() => {
        syncFromServer(cartData.items);
      });
    }
  }, [cartData?.items, syncFromServer]);

  // Tạo map cho thuộc tính
  const attributeMap = allAttributes?.reduce((acc: Record<number, string>, attr: any) => {
    acc[attr.id] = attr.name;
    return acc;
  }, {} as Record<number, string>) ?? {};

  const attributeValueMap = allAttributeValues?.data?.reduce((acc: Record<number, string>, val: any) => {
    acc[val.id] = val.value;
    return acc;
  }, {} as Record<number, string>) ?? {};

  // === LOADING & ERROR STATES ===
  if (authLoading || cartLoading) {
    return <div className="text-center py-12">Đang tải giỏ hàng...</div>;
  }

  if (cartError) {
    return (
      <div className="text-center py-12 text-red-500">
        Lỗi tải giỏ hàng: {(cartError as any).message}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <p className="text-center py-12 text-lg">Giỏ hàng của bạn đang trống.</p>;
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

  // === CỘT BẢNG ===
  const columns = [
    {
      title: 'Hình ảnh',
      key: 'thumb',
      width: 80,
      render: (_: any, record: any) => {
        const thumb = record.variant?.thumb || record.variant?.product?.thumb;
        return (
          <Image
            src={getImageUrl(thumb) || '/placeholder.png'}
            alt={record.variant?.product?.name || 'Sản phẩm'}
            width={64}
            height={64}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            preview={false}
            fallback="/placeholder.png"
          />
        );
      },
    },
    {
      title: 'Sản phẩm',
      key: 'name',
      render: (_: any, r: any) => (
        <div className="font-medium">{r.variant?.product?.name || 'Sản phẩm không xác định'}</div>
      ),
    },
    {
      title: 'Thuộc tính',
      key: 'attributes',
      render: (_: any, r: any) => (
        <span className="text-sm text-gray-600">
          {renderAttributes(r.variant?.attrValues)}
        </span>
      ),
    },
    {
      title: 'Đơn giá',
      key: 'price',
      render: (_: any, r: any) => <span className="font-medium">{formatVND(r.priceAtAdd)}</span>,
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      width: 140,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-1">
          <Button
            size="small"
            icon="-"
            disabled={record.quantity <= 1 || isPending}
            onClick={() => onChangeQuantity(record.quantity - 1, record)}
          />
          <InputNumber
            min={1}
            value={record.quantity}
            onChange={(v) => typeof v === 'number' && onChangeQuantity(v, record)}
            style={{ width: 48 }}
            controls={false}
            disabled={isPending}
          />
          <Button
            size="small"
            icon="+"
            disabled={isPending}
            onClick={() => onChangeQuantity(record.quantity + 1, record)}
          />
        </div>
      ),
    },
    {
      title: 'Tổng',
      key: 'total',
      render: (_: any, r: any) => (
        <span className="font-bold text-lg">{formatVND(r.priceAtAdd * r.quantity)}</span>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 80,
      render: (_: any, record: any) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record)}
          loading={isPending}
        />
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>
          <Link href="/">Trang chủ</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Giỏ hàng</Breadcrumb.Item>
      </Breadcrumb>

      <Table
        dataSource={items}
        columns={columns}
        rowKey="id"
        pagination={false}
        loading={isPending || cartLoading}
        className="shadow-sm"
      />

      <div className="mt-8 flex justify-end items-center gap-6">
        <div className="text-2xl font-bold">Tổng: {formatVND(getTotalPrice())}</div>
        <Button
          type="primary"
          size="large"
          onClick={handleCheckoutClick}
          disabled={isPending}
          className="min-w-40"
        >
          Đặt hàng
        </Button>
      </div>

      {/* Modal đăng nhập */}
      <Modal
        title="Yêu cầu đăng nhập"
        open={isLoginModalVisible}
        onOk={() => router.push(`/login?returnUrl=${encodeURIComponent('/gio-hang')}`)}
        onCancel={() => setIsLoginModalVisible(false)}
        okText="Đăng nhập"
        cancelText="Hủy"
      >
        <p>Bạn cần đăng nhập để tiến hành thanh toán.</p>
      </Modal>

     
    </div>
  );
};

export default ShoppingCart;