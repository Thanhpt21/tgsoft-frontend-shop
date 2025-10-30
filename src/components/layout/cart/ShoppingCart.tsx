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

const ShoppingCart = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // LẤY TỪ ZUSTAND → TỨC THÌ
  const {
    items,
    getTotalPrice,
    updateQuantityOptimistic,
    removeItemOptimistic,
    syncFromServer,
    addItemOptimistic
  } = useCartStore();

  const removeItemMutation = useRemoveCartItem();
  const updateItemMutation = useUpdateCartItem();

  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  const { data: allAttributes } = useAllAttributes();
  const { data: allAttributeValues } = useAttributeValues();

  // ĐỒNG BỘ SERVER SAU KHI CÓ DỮ LIỆU (không block UI)
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch('/api/cart'); // Gọi API thủ công
        const data = await res.json();
        if (data?.items) {
          startTransition(() => {
            syncFromServer(data.items);
          });
        }
      } catch (err) {
        console.error('Sync cart failed:', err);
      }
    };

    if (currentUser) {
      fetchCart();
    }
  }, [currentUser, syncFromServer]);

  const attributeMap = allAttributes?.reduce((acc: Record<number, string>, attr: any) => {
    acc[attr.id] = attr.name;
    return acc;
  }, {} as Record<number, string>) ?? {};

  const attributeValueMap = allAttributeValues?.data?.reduce((acc: Record<number, string>, val: any) => {
    acc[val.id] = val.value;
    return acc;
  }, {} as Record<number, string>) ?? {};

  // HIỆN NGAY DÙ CHƯA CÓ SERVER DATA
  if (authLoading) return <div>Đang xác thực...</div>;
  if (items.length === 0) return <p className="text-center py-8">Giỏ hàng của bạn đang trống.</p>;

  const handleRemoveItem = (item: any) => {
    startTransition(() => {
      removeItemOptimistic(item.id);
      removeItemMutation.mutate(item.id, {
        onError: () => {
          message.error('Xóa thất bại, đang khôi phục...');
        },
      });
    });
  };

  const onChangeQuantity = (value: number | null, item: any) => {
    if (!value || value < 1 || value === item.quantity) return;

    startTransition(() => {
      updateQuantityOptimistic(item.productVariantId, value);
      updateItemMutation.mutate(
        { id: item.id, data: { quantity: value } },
        {
          onError: () => {
            message.error('Cập nhật thất bại');
            updateQuantityOptimistic(item.productVariantId, item.quantity);
          },
        }
      );
    });
  };

  const handleCheckoutClick = () => {
    if (!currentUser) {
      setIsLoginModalVisible(true);
      return;
    }
    router.push('/dat-hang');
  };

  const renderAttributes = (attrValues: Record<string, any>) => {
    if (!attrValues || Object.keys(attrValues).length === 0) return 'Không có thuộc tính';
    return Object.entries(attrValues)
      .map(([attrId, valueId]) => {
        const attrName = attributeMap[Number(attrId)] || `${attrId}`;
        const valueName = attributeValueMap[Number(valueId)] || valueId;
        return `${attrName}: ${valueName}`;
      })
      .join(', ');
  };

  const onAddToCart = (product: any, selectedAttributes: Record<string, any>) => {
    // Kiểm tra sản phẩm có tồn tại trong giỏ hàng không (dựa trên productVariantId và selectedAttributes)
    const existingItem = items.find(item =>
      item.productVariantId === product.productVariantId &&
      JSON.stringify(item.attributes) === JSON.stringify(selectedAttributes)
    );

    if (existingItem) {
      // Nếu sản phẩm đã có, tăng số lượng
      onChangeQuantity(existingItem.quantity + 1, existingItem);
    } else {
      // Nếu sản phẩm chưa có, thêm mới vào giỏ hàng
      const newItem = {
        ...product,
        attributes: selectedAttributes,
        quantity: 1,
      };
      startTransition(() => {
        addItemOptimistic(newItem);
        updateItemMutation.mutate({ ...newItem }, {
          onError: () => {
            message.error('Thêm sản phẩm vào giỏ hàng thất bại.');
          }
        });
      });
    }
  };

  const columns = [
    {
      title: 'Hình ảnh',
      key: 'thumb',
      render: (_: any, record: any) => (
        <Image
          src={getImageUrl(record.thumb) || '/placeholder.png'}
          alt={record.productName}
          width={64}
          height={64}
          style={{ objectFit: 'cover' }}
          preview={false}
          fallback="/placeholder.png"
        />
      ),
    },
    { title: 'Sản phẩm', key: 'name', render: (_: any, r: any) => r.productName },
    {
      title: 'Thuộc tính',
      key: 'attributes',
      render: (_: any, r: any) => (
        <span className="text-sm text-gray-600">
          {renderAttributes(r.attributes)}
        </span>
      ),
    },
    { title: 'Đơn giá', key: 'price', render: (_: any, r: any) => formatVND(r.priceAtAdd) },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onChangeQuantity(record.quantity - 1, record)}
            disabled={record.quantity <= 1 || isPending}
            icon="-"
            size="small"
          />
          
          <InputNumber
            min={1}
            value={record.quantity}
            onChange={(value: number | string | null) => {
              if (typeof value === 'number') {
                onChangeQuantity(value, record);
              }
            }}
            style={{ width: `30px` }}  // Giới hạn chiều rộng input number
            controls={false}  // Ẩn nút tăng giảm
            disabled={isPending}
          />

          <Button
            onClick={() => onChangeQuantity(record.quantity + 1, record)}
            icon="+"
            size="small"
            disabled={isPending}
          />
        </div>
      ),
    },
    { title: 'Tổng', key: 'total', render: (_: any, r: any) => formatVND(r.priceAtAdd * r.quantity) },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          icon={<DeleteOutlined />}
          danger
          size="small"
          onClick={() => handleRemoveItem(record)}
          loading={isPending}
        />
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item><Link href="/">Trang chủ</Link></Breadcrumb.Item>
        <Breadcrumb.Item>Giỏ hàng</Breadcrumb.Item>
      </Breadcrumb>

      <Table
        dataSource={items}
        columns={columns}
        rowKey="id"
        pagination={false}
        loading={isPending}
      />

      <div className="mt-6 flex justify-end items-center gap-4">
        <span className="text-xl font-bold">Tổng: {formatVND(getTotalPrice())}</span>
        <Button type="primary" size="large" onClick={handleCheckoutClick} disabled={isPending}>
          Đặt hàng
        </Button>
      </div>

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
