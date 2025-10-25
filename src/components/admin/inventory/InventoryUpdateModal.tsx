
'use client'

import { Modal, Form, InputNumber, Select, message } from 'antd'
import { useEffect, useMemo } from 'react'
import { useUpdateInventory } from '@/hooks/inventory/useUpdateInventory'
import { useWarehouses } from '@/hooks/warehouse/useWarehouses'
import { useInventories } from '@/hooks/inventory/useInventories'

interface Inventory {
  id: number
  productVariantId: number
  warehouseId: number
  qty: number
}

interface Props {
  open: boolean
  onClose: () => void
  inventory: Inventory | null
  refetch?: () => void
}

export function InventoryUpdateModal({ open, onClose, inventory, refetch }: Props) {
  const [form] = Form.useForm()
  const { mutateAsync: updateInventory, isPending } = useUpdateInventory()
  const { data: warehouses } = useWarehouses()
  
  // Lấy danh sách inventory hiện tại của variant này
  const { data: inventories } = useInventories({ 
    productVariantId: inventory?.productVariantId 
  })

  useEffect(() => {
    if (open && inventory) {
      form.setFieldsValue({
        warehouseId: inventory.warehouseId,
        qty: inventory.qty,
      })
    }
  }, [open, inventory, form])

  // Filter ra những warehouse chưa được thêm HOẶC là warehouse hiện tại đang edit
  const availableWarehouses = useMemo(() => {
    if (!warehouses?.data || !inventories || !inventory) return warehouses?.data || []
    
    // Lấy danh sách warehouseId đã được thêm (trừ warehouse hiện tại)
    const usedWarehouseIds = inventories
      .filter((inv: any) => inv.id !== inventory.id) // Loại bỏ record hiện tại
      .map((inv: any) => inv.warehouseId)
    
    // Filter ra những warehouse chưa dùng HOẶC là warehouse hiện tại
    return warehouses.data.filter((warehouse: any) => 
      !usedWarehouseIds.includes(warehouse.id)
    )
  }, [warehouses, inventories, inventory])

  const handleSubmit = async (values: any) => {
    if (!inventory) return
    try {
      await updateInventory({ id: inventory.id, data: values })
      message.success('Cập nhật tồn kho thành công')
      refetch?.()
      onClose()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Cập nhật thất bại')
    }
  }

  return (
    <Modal
      title="Cập nhật tồn kho"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={isPending}
      okText="Cập nhật"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Kho hàng"
          name="warehouseId"
          rules={[{ required: true, message: 'Vui lòng chọn kho hàng' }]}
        >
          <Select
            placeholder="Chọn kho hàng"
            showSearch
            optionFilterProp="children"
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