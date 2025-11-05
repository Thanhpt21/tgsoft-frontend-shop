'use client';

import { Modal, Typography, Table, Image } from 'antd';
import { useOrderOne } from '@/hooks/order/useOrderOne';
import { formatDate, formatVND } from '@/utils/helpers';
import { Order, OrderItem } from '@/types/order.type';
import { getImageUrl } from '@/utils/getImageUrl';
import { useAllAttributes } from '@/hooks/attribute/useAllAttributes';
import { useAttributeValues } from '@/hooks/attribute-value/useAttributeValues';
import { GiftProductDisplay } from '@/components/layout/common/GiftProductDisplay';

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  orderId?: number;
}

const { Title } = Typography;

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ open, onClose, orderId }) => {
  const { data: order, isLoading, isError, error } = useOrderOne(orderId);

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

  if (isLoading) {
    return (
      <Modal open={open} title="Chi tiết đơn hàng" onCancel={onClose} footer={null}>
        Đang tải...
      </Modal>
    );
  }

  if (isError) {
    console.error('Lỗi khi tải chi tiết đơn hàng:', error);
    return (
      <Modal open={open} title="Chi tiết đơn hàng" onCancel={onClose} footer={null}>
        Đã xảy ra lỗi khi tải chi tiết đơn hàng.
      </Modal>
    );
  }

  if (!order) return null;

  const shipping = order.shippingInfo as any;

  // ✅ Đọc trực tiếp tên địa phương từ shippingInfo
  const provinceName = shipping?.province_name || shipping?.province || '';
  const districtName = shipping?.district_name || shipping?.district || '';
  const wardName = shipping?.ward_name || shipping?.ward || '';

  // ✅ Tạo địa chỉ đầy đủ
  const fullAddress = `${shipping?.name || ''}\n${shipping?.phone || ''}\n${shipping?.address || ''}\n${wardName ? wardName + ', ' : ''}${districtName ? districtName + ', ' : ''}${provinceName}`;

  // Tạo data dạng { label, value } cho table thông tin chung
  const orderInfoData = [
    { key: '1', label: 'Mã đơn hàng', value: order.id },
    { key: '2', label: 'Tài khoản email đặt hàng', value: order.user?.email || '-' },
    { key: '3', label: 'Trạng thái đơn hàng', value: order.status },
    { key: '4', label: 'Trạng thái thanh toán', value: order.paymentStatus },
    { key: '5', label: 'Ngày tạo đơn hàng', value: formatDate(order.createdAt) },
    {
      key: '6',
      label: 'Thông tin nhận hàng',
      value: fullAddress,
    },
    { key: '7', label: 'Ghi chú', value: shipping?.note || 'Không có' },
    { key: '8', label: 'Tổng tiền đơn hàng', value: formatVND(order.totalAmount) },
    { key: '9', label: 'Phí vận chuyển', value: formatVND(order.shippingFee ?? 0) },
    { 
      key: '10', 
      label: 'Phương thức giao hàng', 
      value: order.deliveryMethod === 'XTEAM' ? 'Giao hàng nhanh' : 'Giao hàng tiết kiệm' 
    },
  ];

  // Hàm ánh xạ thuộc tính sản phẩm
  const renderAttributes = (attrValues: Record<string, any>) => {
    if (!attrValues || Object.keys(attrValues).length === 0) return 'Không có thuộc tính';
    return Object.entries(attrValues)
      .map(([attrId, valueId]) => {
        const attrName = attributeMap[Number(attrId)] || `Thuộc tính ${attrId}`;
        const valueName = attributeValueMap[Number(valueId)] || valueId;
        return `${attrName}: ${valueName}`;
      })
      .join(' | ');
  };

  return (
    <Modal
      open={open}
      title={`Chi tiết đơn hàng #${order.id}`}
      onCancel={onClose}
      footer={null}
      width={1200}
    >
      <Title level={5} style={{ marginBottom: 8 }}>Thông tin đơn hàng</Title>
      <Table
        dataSource={orderInfoData}
        columns={[
          { title: 'Thông tin', dataIndex: 'label', key: 'label', width: '30%' },
          { 
            title: 'Giá trị', 
            dataIndex: 'value', 
            key: 'value',
            render: (text) => <span style={{ whiteSpace: 'pre-line' }}>{text}</span>
          },
        ]}
        pagination={false}
        rowKey="key"
        size="small"
      />

      <Title level={5} style={{ marginTop: 16 }}>Sản phẩm trong đơn hàng</Title>
      <Table
        dataSource={order.items as OrderItem[]}
        rowKey="id"
        pagination={false}
        columns={[
          {
            title: 'Hình ảnh',
            key: 'image',
            render: (_text, item: OrderItem) => {
              const url = getImageUrl(item.productVariant?.thumb || item.productVariant?.product?.thumb || null);
              return url ? <Image preview={false} src={url} alt={item.sku} width={50} height={50} /> : 'Không có ảnh';
            },
          },
          {
            title: 'Sản phẩm',
            key: 'product',
            render: (_text, item: OrderItem) => {
              const variant = item.productVariant;
              const productName = variant?.product?.name || variant?.sku || 'N/A';
              const attrs = variant?.attrValues
                ? renderAttributes(variant.attrValues)
                : 'Không có thuộc tính';
              return (
                <div>
                  <div>{productName}</div>
                  <div className="text-sm text-gray-500">{attrs}</div>
                  
                  {/* 👇 Hiển thị quà tặng */}
                  {item.giftProductId && item.giftQuantity && (
                    <div className="mt-2">
                      <GiftProductDisplay 
                        giftProductId={item.giftProductId}
                        giftQuantity={item.giftQuantity}
                      />
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
          },
          {
            title: 'Đơn giá',
            key: 'unitPrice',
            render: (_text, item: OrderItem) => formatVND(item.unitPrice),
          },
          {
            title: 'Thành tiền',
            key: 'totalPrice',
            render: (_text, item: OrderItem) => formatVND(item.unitPrice * item.quantity),
          },
        ]}
      />
    </Modal>
  );
};

export default OrderDetailModal;