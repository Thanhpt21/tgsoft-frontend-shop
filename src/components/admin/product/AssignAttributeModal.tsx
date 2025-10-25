'use client'

import { Modal, Select, message, Button, Space, Table, Tag, Tooltip } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useAllAttributes } from '@/hooks/attribute/useAllAttributes'
import { useProductAttributes } from '@/hooks/product-attribute/useProductAttributes'
import { useAssignProductAttribute } from '@/hooks/product-attribute/useAssignProductAttribute'
import { useRemoveProductAttribute } from '@/hooks/product-attribute/useRemoveProductAttribute'
import { Attribute } from '@/types/attribute.type'

interface AssignAttributeModalProps {
  productId: number
  open: boolean
  onClose: () => void
}

export const AssignAttributeModal = ({ productId, open, onClose }: AssignAttributeModalProps) => {
  const { data: allAttributes } = useAllAttributes()
  const { data: assignedAttributes, refetch: refetchAssigned } = useProductAttributes(productId)
  const { mutateAsync: assignAttribute } = useAssignProductAttribute()
  const { mutateAsync: removeAttribute } = useRemoveProductAttribute()

  const [selectedAttrs, setSelectedAttrs] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)

  const availableAttributes = allAttributes?.filter(
    (a: Attribute) => !assignedAttributes?.some((pa: any) => pa.attributeId === a.id)
  )

  const handleAssign = async () => {
    if (!selectedAttrs.length) return message.warning('Vui lòng chọn ít nhất 1 thuộc tính')
    if (selectedAttrs.length + (assignedAttributes?.length || 0) > 3)
      return message.warning('Tối đa 3 thuộc tính trên sản phẩm')

    try {
      setLoading(true)
      await Promise.all(
        selectedAttrs.map((attrId) => assignAttribute({ productId, attributeId: attrId }))
      )
      message.success('Gán thuộc tính thành công')
      setSelectedAttrs([])
      refetchAssigned?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Gán thuộc tính thất bại')
    } finally {
      setLoading(false)
    }
  }

    const handleRemove = (attributeId: number, attributeName?: string) => {
    Modal.confirm({
        title: 'Xác nhận xóa thuộc tính',
        content: `Bạn có chắc chắn muốn xóa thuộc tính "${attributeName}" khỏi sản phẩm không?`,
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: async () => {
        setRemovingId(attributeId)
        try {
            await removeAttribute({ productId, attributeId })
            message.success('Xóa thuộc tính thành công')
            refetchAssigned?.()
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Xóa thất bại')
        } finally {
            setRemovingId(null)
        }
        },
    })
    }

  useEffect(() => {
    if (!open) setSelectedAttrs([])
  }, [open])

  const columns = [
    {
      title: 'Tên thuộc tính',
      key: 'name',
      render: (record: any) => {
        const attr = allAttributes?.find((a: Attribute) => a.id === record.attributeId)
        return attr?.name || record.attributeId
      },
    },
    {
      title: 'Ngày gán',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
    {
    title: 'Hành động',
    key: 'action',
    width: 80,
    render: (record: any) => {
        const attr = allAttributes?.find((a: Attribute) => a.id === record.attributeId)
        return (
        <Tooltip title="Xóa thuộc tính">
            <Button
            type="text"
            icon={<DeleteOutlined style={{ color: 'red' }} />}
            loading={removingId === record.attributeId}
            onClick={() => handleRemove(record.attributeId, attr?.name)}
            />
        </Tooltip>
        )
    },
    }
  ]

  return (
    <Modal
      title="Gán thuộc tính cho sản phẩm"
      open={open}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>Đóng</Button>
          <Button type="primary" loading={loading} onClick={handleAssign}>
            Thêm mới
          </Button>
        </Space>
      }
      width={600}
    >
      <Select
        mode="multiple"
        style={{ width: '100%', marginBottom: 16 }}
        placeholder="Chọn thuộc tính"
        value={selectedAttrs}
        onChange={setSelectedAttrs}
        options={availableAttributes?.map((a: Attribute) => ({ label: a.name, value: a.id })) || []}
        maxTagCount={3}
      />

      <Table
        dataSource={assignedAttributes || []}
        columns={columns}
        rowKey={(record) => record.attributeId}
        pagination={false}
      />
    </Modal>
  )
}
