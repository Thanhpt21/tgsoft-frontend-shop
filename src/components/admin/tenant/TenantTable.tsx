import { Table, Tag, Space, Tooltip, Input, Button, Modal, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons'
import { useState } from 'react'

import type { Tenant } from '@/types/tenant.type'
import { useDeleteTenant } from '@/hooks/tenant/useDeleteTenant'
import { useTenants } from '@/hooks/tenant/useTenants'
import { TenantCreateModal } from './TenantCreateModal'
import { TenantUpdateModal } from './TenantUpdateModal'
import UserListModalOfTenant from './UserListOfTenantModal'

export default function TenantTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [openUserModal, setOpenUserModal] = useState(false)
  const [tenantIdForUsers, setTenantIdForUsers] = useState<number | null>(null)

  const { data, isLoading, refetch } = useTenants({ page, limit: 10, search })
  const { mutateAsync: deleteTenant } = useDeleteTenant()

  const columns: ColumnsType<Tenant> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên cửa hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => (
        <Tag color="blue">{slug}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'Hoạt động' : 'Tạm khóa'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
           <Tooltip title="Xem nhân viên">
            <TeamOutlined
              style={{ color: '#52c41a', cursor: 'pointer' }}
              onClick={() => handleOpenUserModal(record.id)} // Mở modal khi click
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedTenant(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa cửa hàng',
                  content: `Bạn có chắc chắn muốn xóa cửa hàng "${record.name}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteTenant(record.id)
                      message.success('Xóa cửa hàng thành công')
                      refetch?.()
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || 'Xóa thất bại')
                    }
                  },
                })
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const handleOpenUserModal = (tenantId: number) => {
    if (tenantId === null || tenantId === undefined) {
      message.error("Cửa hàng không hợp lệ. Không thể tải danh sách nhân viên.");
      return;
    }

    setTenantIdForUsers(tenantId);
    setOpenUserModal(true);
  }

  const handleSearch = () => {
    setPage(1);
    setSearch(inputValue);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm theo tên cửa hàng..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
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
          showTotal: (total) => `Tổng ${total} cửa hàng`,
        }}
      />

      <TenantCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <TenantUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        tenant={selectedTenant}
        refetch={refetch}
      />

      <UserListModalOfTenant
        tenantId={tenantIdForUsers ?? 0}  // Giá trị mặc định nếu null
        visible={openUserModal}
        onClose={() => setOpenUserModal(false)}
      />
    </div>
  );
}
