'use client';

import { Table, Button, InputNumber, Image, Breadcrumb, Modal, message, Checkbox, Empty, Card } from 'antd';
import { DeleteOutlined, HomeOutlined, MinusOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
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
    selectedItems,
    setSelectedItems,
  } = useCartStore();

  const removeItemMutation = useRemoveCartItem();
  const updateItemMutation = useUpdateCartItem();

  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: allAttributes } = useAllAttributes();
  const { data: allAttributeValues } = useAttributeValues();

  const { data: cartData, isLoading: cartLoading, error: cartError } = useMyCart();
  console.log('Giỏ hàng data:', cartData);

  useEffect(() => {
    if (cartData?.items) {
      startTransition(() => {
        syncFromServer(cartData.items);
      });
    }
  }, [cartData?.items, syncFromServer]);
  
console.log('🧺 items trong store:', items);

  // Cập nhật selectAll khi selectedItems thay đổi
  useEffect(() => {
    setSelectAll(selectedItems.size > 0 && selectedItems.size === items.length);
  }, [selectedItems, items.length]);

  // Tạo map cho thuộc tính
  const attributeMap = allAttributes?.reduce((acc: Record<number, string>, attr: any) => {
    acc[attr.id] = attr.name;
    return acc;
  }, {} as Record<number, string>) ?? {};

  const attributeValueMap = allAttributeValues?.data?.reduce((acc: Record<number, string>, val: any) => {
    acc[val.id] = val.value;
    return acc;
  }, {} as Record<number, string>) ?? {};

  // === CHECKBOX HANDLERS ===
  const handleCheckboxChange = (itemId: number) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const allItemIds = items.map(item => item.id);
      setSelectedItems(new Set(allItemIds));
    } else {
      setSelectedItems(new Set());
    }
  };

  // === TÍNH TỔNG CHỈ CÁC ITEM ĐƯỢC CHỌN ===
  const getSelectedTotal = () => {
    return items
      .filter(item => selectedItems.has(item.id))
      .reduce((total, item) => total + item.priceAtAdd * item.quantity, 0);
  };

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
      // Xóa khỏi selectedItems nếu có
      const newSelected = new Set(selectedItems);
      newSelected.delete(item.id);
      setSelectedItems(newSelected);
      
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
    
    if (selectedItems.size === 0) {
      message.warning('Vui lòng chọn ít nhất một sản phẩm để đặt hàng');
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
      title: (
        <Checkbox
          checked={selectAll}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      key: 'checkbox',
      width: 50,
      render: (_: any, record: any) => (
        <Checkbox
          checked={selectedItems.has(record.id)}
          onChange={() => handleCheckboxChange(record.id)}
        />
      ),
    },
    {
      title: 'Hình ảnh',
      key: 'thumb',
      width: 80,
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
         <Table
          rowKey="id"
          dataSource={items}
          columns={columns}
          pagination={false}
          className="!rounded-2xl !overflow-hidden shadow-md"
        />

      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Đã chọn: <span className="font-semibold">{selectedItems.size}</span> / {items.length} sản phẩm
        </div>
        <div className="flex items-center gap-6">
          <div className="text-2xl font-bold">Tổng: {formatVND(getSelectedTotal())}</div>
          <Button
            type="primary"
            size="large"
            onClick={handleCheckoutClick}
            disabled={isPending || selectedItems.size === 0}
            className="min-w-40"
          >
            Đặt hàng ({selectedItems.size})
          </Button>
        </div>
      </div>
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
    </div>
  );
};

export default ShoppingCart;