'use client'

import { Table, Tag, Space, Tooltip, Input, Button, Modal, message, Image } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Config } from '@/types/config.type'
import { useConfigs } from '@/hooks/config/useConfigs'
import { useDeleteConfig } from '@/hooks/config/useDeleteConfig'
import { ConfigCreateModal } from './ConfigCreateModal'
import { ConfigUpdateModal } from './ConfigUpdateModal'
import { getImageUrl } from '@/utils/getImageUrl'

export default function ConfigTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<Config | null>(null)

  const { data, isLoading, refetch } = useConfigs({ page, limit: 10, search })
  const { mutateAsync: deleteConfig } = useDeleteConfig()

  const columns: ColumnsType<Config> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: 100,
      align: 'center',
      render: (logo: string | null) => {
        const imageUrl = getImageUrl(logo)

        if (!imageUrl) {
          return (
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded">
              <PictureOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
            </div>
          )
        }

        return (
          <Image
            src={imageUrl}
            alt="Logo"
            width={40}
            height={40}
            className="object-cover rounded"
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            preview={false}
          />
        )
      },
    },
    {
      title: 'Tên website',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
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
                setSelectedConfig(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa cấu hình',
                  content: `Bạn có chắc chắn muốn xóa cấu hình "${record.name}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteConfig(record.id)
                      message.success('Xóa cấu hình thành công')
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

  const handleSearch = () => {
    setPage(1)
    setSearch(inputValue)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          
        </div>

         {!(data?.data?.length > 0) && ( // ⭐ chỉ hiển thị khi chưa có cấu hình
            <Button type="primary" onClick={() => setOpenCreate(true)}>
              Tạo mới
            </Button>
          )}
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
          showTotal: (total) => `Tổng ${total} cấu hình`,
        }}
      />

      <ConfigCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <ConfigUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        config={selectedConfig}
        refetch={refetch}
      />
    </div>
  )
}
