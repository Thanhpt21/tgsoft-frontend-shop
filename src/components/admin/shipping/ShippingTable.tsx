'use client';

import {
  Table,
  Input,
  Button,
  Space,
  Tooltip,
  Modal,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useShippings } from '@/hooks/shipping/useShippings';
import { useDeleteShipping } from '@/hooks/shipping/useDeleteShipping';
import { ShippingCreateModal } from './ShippingCreateModal';
import { ShippingUpdateModal } from './ShippingUpdateModal';
import { Shipping } from '@/types/shipping.type';


export default function ShippingTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<Shipping | null>(null);

  const { data, isLoading, refetch } = useShippings({ page, limit: 10, search });
  const { mutateAsync: deleteShipping, isPending: isDeleting } = useDeleteShipping();

  const columns: ColumnsType<Shipping> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên tỉnh/thành phố',
      dataIndex: 'provinceName',
      key: 'provinceName',
    },
    {
      title: 'Phí vận chuyển',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee) => fee?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedShipping(record);
                setOpenUpdate(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa phí vận chuyển',
                  content: `Bạn có chắc chắn muốn xóa phí vận chuyển cho "${record.provinceName}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteShipping(record.id);
                      message.success('Xóa phí vận chuyển thành công');
                      refetch?.();
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || 'Xóa thất bại');
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
            placeholder="Tìm kiếm theo tỉnh/thành phố..."
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

      <ShippingCreateModal open={openCreate} onClose={() => setOpenCreate(false)} refetch={refetch} />
      <ShippingUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        shipping={selectedShipping}
        refetch={refetch}
      />
    </div>
  );
}