'use client';

import {
  Table,
  Tag,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  message,
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useOrders } from '@/hooks/order/useOrders';
import { useDeleteOrder } from '@/hooks/order/useDeleteOrder';
import { useUpdateOrder } from '@/hooks/order/useUpdateOrder';
import { Order } from '@/types/order.type';
import { OrderStatus, PaymentStatus } from '@/enums/order.enums';
import OrderDetailModal from './OrderDetailModal';
import { formatVND, formatDate } from '@/utils/helpers';
import PaymentDetailModal from './PaymentDetailModal';

export default function OrderTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | undefined>(undefined);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(undefined);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // State to control Payment Modal
  const [selectedPaymentOrderId, setSelectedPaymentOrderId] = useState<number | undefined>(undefined); // State to hold the order ID for payment modal

  const { data, isLoading, refetch } = useOrders({
    page,
    limit: 10,
    search,
    status: statusFilter,
    // paymentStatus: paymentStatusFilter, // nếu backend hỗ trợ filter này
  });

  const { mutateAsync: deleteOrder } = useDeleteOrder();
  const { mutateAsync: updateOrder } = useUpdateOrder();

  const handleStatusChange = async (value: OrderStatus, record: Order) => {
    try {
      await updateOrder({ id: record.id, data: { status: value } });
      message.success(`Cập nhật trạng thái thành công: ${value}`);
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleDeleteOrder = async (id: number) => {
    try {
      await deleteOrder(id);
      message.success('Xóa đơn hàng thành công');
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa thất bại');
    }
  };

  const showOrderDetail = (id: number) => {
    setSelectedOrderId(id);
    setIsDetailModalOpen(true);
  };

  const hideOrderDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedOrderId(undefined);
  };

    const showPaymentDetails = (orderId: number) => {
    setSelectedPaymentOrderId(orderId); // Set the order ID for payment details modal
    setIsPaymentModalOpen(true); // Open the modal
  };

  const hidePaymentDetails = () => {
    setIsPaymentModalOpen(false);
    setSelectedPaymentOrderId(undefined);
  };

  const columns: ColumnsType<Order & { user?: { email?: string } }> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'ID đơn hàng',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Email khách hàng',
      dataIndex: ['user', 'email'],
      key: 'email',
      render: (email) => email || '-',
    },
    {
      title: 'Tổng tiền hàng',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => formatVND(amount),
    },
    {
      title: 'Phí ship',
      dataIndex: 'shippingFee',
      key: 'shippingFee',
      render: (shippingFee: number) => formatVND(shippingFee), // Hiển thị phí ship theo định dạng VND
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
     {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus, record: Order) => (
        <Select
          value={status}
          style={{ width: 160 }}
          onChange={(value) => handleStatusChange(value as OrderStatus, record)}
        >
          {Object.values(OrderStatus).map((st) => (
            <Select.Option key={st} value={st}>
              <Tag color={
                st === OrderStatus.DRAFT ? 'yellow' :
                st === OrderStatus.PAID ? 'green' :
                st === OrderStatus.PROCESSING ? 'blue' :
                st === OrderStatus.SHIPPED ? 'cyan' :
                st === OrderStatus.DELIVERED ? 'geekblue' :
                st === OrderStatus.CANCELLED ? 'red' :
                'gray'
              }>
                {st}
              </Tag>
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
           {record.paymentMethod?.code === 'VNPAY' && (
          <Tooltip title="Xem thanh toán">
            <InfoCircleOutlined
              onClick={() => showPaymentDetails(record.id)}
              style={{ color: 'blue', cursor: 'pointer' }}
            />
          </Tooltip>
        )}
          <Tooltip title="Xem chi tiết">
            <EyeOutlined
              onClick={() => showOrderDetail(record.id)}
              style={{ color: 'green', cursor: 'pointer' }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa đơn hàng',
                  content: `Bạn có chắc chắn muốn xóa đơn hàng ID ${record.id}?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => await handleDeleteOrder(record.id),
                });
              }}
              style={{ color: 'red', cursor: 'pointer' }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center mb-4 gap-2">
        <Input
          placeholder="Tìm kiếm theo ID hoặc email"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={() => { setSearch(inputValue); setPage(1); refetch?.(); }}>
          Tìm kiếm
        </Button>

        <Select
          placeholder="Lọc trạng thái"
          allowClear
          style={{ width: 180 }}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
        >
          {Object.values(OrderStatus).map((st) => (
            <Select.Option key={st} value={st}>{st}</Select.Option>
          ))}
        </Select>

        <Button type="primary" onClick={() => { setPage(1); refetch?.(); }}>
          Áp dụng bộ lọc
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
        }}
      />

      <OrderDetailModal
        open={isDetailModalOpen}
        onClose={hideOrderDetail}
        orderId={selectedOrderId}
      />

        <PaymentDetailModal
        open={isPaymentModalOpen}
        onClose={hidePaymentDetails}
        orderId={selectedPaymentOrderId} // Pass the selected order ID
      />
    </div>
  );
}
