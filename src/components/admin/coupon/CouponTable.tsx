'use client';

import {
  Table,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

import { useCoupons } from '@/hooks/coupon/useCoupons';
import { useDeleteCoupon } from '@/hooks/coupon/useDeleteCoupon';

import dayjs from 'dayjs';
import { CouponUpdateModal } from './CouponUpdateModal';
import { CouponCreateModal } from './CouponCreateModal';
import { formatDate, formatVND } from '@/utils/helpers';

export default function CouponTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const { data, isLoading, refetch } = useCoupons({ page, limit: 10, search });
  const { mutateAsync: deleteCoupon, isPending: isDeleting } = useDeleteCoupon();

  const columns: ColumnsType<Coupon> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * Number(process.env.NEXT_PUBLIC_PAGE_SIZE) + index + 1,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discount',
      key: 'discount',
      render: (value) => (value !== null ? formatVND(value) : '-'),
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date) => formatDate(date), // Sử dụng hàm formatDate
    },
    {
      title: 'Giới hạn',
      dataIndex: 'usageLimit',
      key: 'usageLimit',
    },
    {
      title: 'Đã dùng',
      dataIndex: 'usedCount',
      key: 'usedCount',
    },
    {
      title: 'Min đơn',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      render: (value) => (value !== null ? formatVND(value) : '-'), // Sử dụng formatVND
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedCoupon(record);
                setOpenUpdate(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá mã giảm giá',
                  content: `Bạn có chắc chắn muốn xoá mã "${record.title}" không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteCoupon(record.id);
                      message.success('Xoá mã giảm giá thành công');
                      refetch();
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || 'Xoá thất bại');
                    }
                  },
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = () => {
    setPage(1);
    setSearch(inputValue);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm mã giảm giá..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Button type="primary" onClick={handleSearch}>
            <SearchOutlined /> Tìm kiếm
          </Button>
        </div>
        <Button type="primary" onClick={() => setOpenCreate(true)}>
          Tạo mới
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

      <CouponCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <CouponUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        coupon={selectedCoupon}
        refetch={refetch}
      />
    </div>
  );
}