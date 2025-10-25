'use client';

import { Table, Button, InputNumber, Image, Breadcrumb, Modal, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { useMyCart } from '@/hooks/cart/useMyCart';
import { useRemoveCartItem } from '@/hooks/cart/useRemoveCartItem';
import { useUpdateCartItem } from '@/hooks/cart/useUpdateCartItem';
import { useAllAttributes } from '@/hooks/attribute/useAllAttributes';
import { useAttributeValues } from '@/hooks/attribute-value/useAttributeValues';
import { useCheckoutCart } from '@/hooks/cart/useCheckoutCart';
import { getImageUrl } from '@/utils/getImageUrl';
import { formatVND } from '@/utils/helpers';

import type { CartItem } from '@/types/cart.type';

const ShoppingCart = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const { data: cart, isLoading } = useMyCart();
  const removeItemMutation = useRemoveCartItem();
  const updateItemMutation = useUpdateCartItem();
  const checkoutMutation = useCheckoutCart();
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);


  const { data: allAttributes } = useAllAttributes();
  const { data: allAttributeValues } = useAttributeValues();


  const attributeMap = allAttributes?.reduce((acc: Record<number, string>, attr: any) => {
    acc[attr.id] = attr.name;
    return acc;
  }, {} as Record<number, string>) ?? {};

  const attributeValueMap = allAttributeValues?.data?.reduce((acc: Record<number, string>, val: any) => {
    acc[val.id] = val.value;
    return acc;
  }, {} as Record<number, string>) ?? {};

  if (isLoading || authLoading) return <div>Đang tải giỏ hàng...</div>;

  if (!cart || cart.items.length === 0) return <p>Giỏ hàng của bạn đang trống.</p>;

  const handleRemoveItem = (item: CartItem) => removeItemMutation.mutate(item.id);

  const onChangeQuantity = (value: number | null, item: CartItem) => {
    if (value !== null && value > 0 && value !== item.quantity) {
      updateItemMutation.mutate({ id: item.id, data: { quantity: value } });
    }
  };

  const handleCheckoutClick = () => {
    if (!currentUser) {
      setIsLoginModalVisible(true);
      return;
    }

    router.push('/dat-hang');
  };

  const handleLoginModalOk = () => {
    setIsLoginModalVisible(false);
    const returnUrl = encodeURIComponent(`/gio-hang`);
    router.push(`/login?returnUrl=${returnUrl}`);
  };

  const handleLoginModalCancel = () => setIsLoginModalVisible(false);

  const renderAttributes = (attrValues: Record<string, any>) => {
    if (!attrValues || Object.keys(attrValues).length === 0) return 'Không có thuộc tính';
    return Object.entries(attrValues)
      .map(([attrId, valueId]) => {
        const attrName = attributeMap[Number(attrId)] || `Thuộc tính ${attrId}`;
        const valueName = attributeValueMap[Number(valueId)] || valueId;
        return `${attrName}: ${valueName}`;
      })
      .join(', ');
  };

  const columns = [
    {
      title: 'Hình ảnh',
      key: 'thumb',
      render: (_: any, record: CartItem) => {
        const thumbUrl = getImageUrl(record.variant?.thumb || null);
        return (
          <Image
            src={thumbUrl || '/placeholder.png'}
            alt={record.variant?.product?.name || 'Sản phẩm'}
            width={64}
            height={64}
            style={{ objectFit: 'cover' }}
            preview={false}
          />
        );
      },
    },
    {
      title: 'Sản phẩm',
      key: 'name',
      render: (_: any, record: CartItem) => record.variant?.product?.name || 'N/A',
    },
    {
      title: 'SKU',
      key: 'sku',
      render: (_: any, record: CartItem) => record.variant?.sku || 'N/A',
    },
    {
      title: 'Thuộc tính',
      key: 'attributes',
      render: (_: any, record: CartItem) => {
        const attributes = record.variant?.attrValues
          ? renderAttributes(record.variant.attrValues)
          : 'Không có thuộc tính';
        return <span className="text-sm text-gray-600">{attributes}</span>;
      },
    },
    {
      title: 'Đơn giá',
      key: 'priceAtAdd',
      render: (_: any, record: CartItem) => formatVND(record.priceAtAdd),
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (_: any, record: CartItem) => (
        <InputNumber min={1} value={record.quantity} onChange={(value) => onChangeQuantity(value, record)} />
      ),
    },
    {
      title: 'Tổng cộng',
      key: 'totalPrice',
      render: (_: any, record: CartItem) => formatVND(record.priceAtAdd * record.quantity),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: CartItem) => (
        <Button icon={<DeleteOutlined />} danger size="small" onClick={() => handleRemoveItem(record)} />
      ),
    },
  ];

  const totalAmount = cart.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);

  return (
    <div>
      <div className="mb-4">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Giỏ hàng của bạn</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <Table dataSource={cart.items} columns={columns} rowKey={(record) => record.id} pagination={false} />

      <div className="mt-4 flex justify-end items-center">
        <span className="font-semibold text-lg mr-4">Tổng cộng: {formatVND(totalAmount)}</span>
        <Button type="primary" size="large" onClick={handleCheckoutClick}>
          Đặt hàng
        </Button>
      </div>

      <Modal
        title="Yêu cầu đăng nhập"
        open={isLoginModalVisible}
        onOk={handleLoginModalOk}
        onCancel={handleLoginModalCancel}
        okText="Đăng nhập ngay"
        cancelText="Hủy"
      >
        <p>Bạn cần đăng nhập để tiến hành thanh toán.</p>
      </Modal>
    </div>
  );
};

export default ShoppingCart;
