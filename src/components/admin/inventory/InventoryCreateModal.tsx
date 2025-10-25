'use client'

import { Modal, Form, InputNumber, Select, message } from 'antd'
import { useEffect, useMemo } from 'react'
import { useCreateInventory } from '@/hooks/inventory/useCreateInventory'
import { useWarehouses } from '@/hooks/warehouse/useWarehouses'
import { useInventories } from '@/hooks/inventory/useInventories'

interface Props {
  open: boolean
  onClose: () => void
  refetch?: () => void
  productVariantId: number
}

export function InventoryCreateModal({ open, onClose, refetch, productVariantId }: Props) {
  const [form] = Form.useForm()
  const { mutateAsync: createInventory, isPending } = useCreateInventory()
  const { data: warehouses } = useWarehouses()
  
  // Lấy danh sách inventory hiện tại của variant này
  const { data: inventories } = useInventories({ productVariantId })

  useEffect(() => {
    if (open) {
      form.resetFields()
      form.setFieldsValue({ productVariantId })
    }
  }, [open, form, productVariantId])

  // Filter ra những warehouse chưa được thêm
  const availableWarehouses = useMemo(() => {
    if (!warehouses?.data || !inventories) return warehouses?.data || []
    
    // Lấy danh sách warehouseId đã được thêm
    const usedWarehouseIds = inventories.map((inv: any) => inv.warehouseId)
    
    // Filter ra những warehouse chưa dùng
    return warehouses.data.filter((warehouse: any) => 
      !usedWarehouseIds.includes(warehouse.id)
    )
  }, [warehouses, inventories])

  const handleSubmit = async (values: any) => {
    try {
      await createInventory(values)
      message.success('Thêm tồn kho thành công')
      refetch?.()
      onClose()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Thêm tồn kho thất bại')
    }
  }

  return (
    <Modal
      title="Thêm tồn kho mới"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={isPending}
      okText="Thêm"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="productVariantId" hidden>
          <InputNumber />
        </Form.Item>

        <Form.Item
          label="Kho hàng"
          name="warehouseId"
          rules={[{ required: true, message: 'Vui lòng chọn kho hàng' }]}
        >
          <Select
            placeholder="Chọn kho hàng"
            showSearch
            optionFilterProp="children"
            notFoundContent={
              availableWarehouses.length === 0 
                ? "Tất cả kho đã được thêm" 
                : "Không tìm thấy kho"
            }
          >
            {availableWarehouses?.map((warehouse: any) => (
              <Select.Option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Số lượng"
          name="qty"
          rules={[
            { required: true, message: 'Vui lòng nhập số lượng' },
            { type: 'number', min: 0, message: 'Số lượng phải >= 0' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Nhập số lượng"
            min={0}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}