'use client'

import { Modal, Form, Input, Button, Select, Row, Col, message } from 'antd'
import { useEffect, useState } from 'react'
import { useCreateWarehouse } from '@/hooks/warehouse/useCreateWarehouse'
import { District, Province, Ward } from '@/types/address.type'

interface WarehouseCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const WarehouseCreateModal = ({ open, onClose, refetch }: WarehouseCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateWarehouse()

  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])

  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(undefined)
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(undefined)
  const [selectedWard, setSelectedWard] = useState<string | undefined>(undefined)

  const [loading, setLoading] = useState({ provinces: false, districts: false, wards: false })

  useEffect(() => {
    if (open) {
      fetchProvinces()
    } else {
      form.resetFields()
      setDistricts([])
      setWards([])
    }
  }, [open])

  /** 🔹 Lấy danh sách tỉnh/thành */
  const fetchProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }))
    try {
      const res = await fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
      const data = await res.json()
      if (data.error === 0 && data.data) {
        const formatted = data.data.map((p: any) => ({
          code: p.id.toString(),
          name: p.full_name
        }))
        setProvinces(formatted)
      } else {
        throw new Error('API không trả dữ liệu hợp lệ')
      }
    } catch (error) {
      console.error('❌ Lỗi tải tỉnh:', error)
      message.error('Không thể tải danh sách tỉnh/thành phố')
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }))
    }
  }

  /** 🔹 Lấy danh sách quận/huyện theo tỉnh */
  const fetchDistricts = async (provinceCode: string) => {
    setLoading(prev => ({ ...prev, districts: true }))
    try {
      const res = await fetch(`https://esgoo.net/api-tinhthanh/2/${provinceCode}.htm`)
      const data = await res.json()
      if (data.error === 0 && data.data) {
        const formatted = data.data.map((d: any) => ({
          code: d.id.toString(),
          name: d.full_name
        }))
        setDistricts(formatted)
      } else {
        throw new Error('API không trả dữ liệu quận/huyện hợp lệ')
      }
    } catch (error) {
      console.error('❌ Lỗi tải quận/huyện:', error)
      message.error('Không thể tải danh sách quận/huyện')
    } finally {
      setLoading(prev => ({ ...prev, districts: false }))
    }
  }

  /** 🔹 Lấy danh sách phường/xã theo quận */
  const fetchWards = async (districtCode: string) => {
    setLoading(prev => ({ ...prev, wards: true }))
    try {
      const res = await fetch(`https://esgoo.net/api-tinhthanh/3/${districtCode}.htm`)
      const data = await res.json()
      if (data.error === 0 && data.data) {
        const formatted = data.data.map((w: any) => ({
          code: w.id.toString(),
          name: w.full_name
        }))
        setWards(formatted)
      } else {
        throw new Error('API không trả dữ liệu phường/xã hợp lệ')
      }
    } catch (error) {
      console.error('❌ Lỗi tải phường/xã:', error)
      message.error('Không thể tải danh sách phường/xã')
    } finally {
      setLoading(prev => ({ ...prev, wards: false }))
    }
  }

  /** 🔸 Xử lý khi chọn tỉnh */
  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value)
    setSelectedDistrict(undefined)
    setSelectedWard(undefined)
    setDistricts([])
    setWards([])
    form.setFieldsValue({ district_id: undefined, ward_id: undefined })
    fetchDistricts(value)
  }

  /** 🔸 Xử lý khi chọn quận/huyện */
  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value)
    setSelectedWard(undefined)
    setWards([])
    form.setFieldsValue({ ward_id: undefined })
    fetchWards(value)
  }

  /** 🔸 Xử lý khi chọn phường/xã */
  const handleWardChange = (value: string) => {
    setSelectedWard(value)
  }

  /** ✅ Submit form */
  const onFinish = async (values: any) => {
    try {
      const province = provinces.find(p => p.code === values.province_id)
      const district = districts.find(d => d.code === values.district_id)
      const ward = wards.find(w => w.code === values.ward_id)

      const location = {
        name: values.name,
        phone: values.phone || undefined,
        address: values.address,
        province_id: Number(values.province_id),
        province_name: province?.name,
        district_id: Number(values.district_id),
        district_name: district?.name,
        ward_id: Number(values.ward_id),
        ward_name: ward?.name
      }

      const data = {
        name: values.name,
        code: values.code || undefined,
        location
      }

      await mutateAsync(data)
      message.success('Tạo nhà kho thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error) {
      console.error(error)
      message.error('Lỗi tạo nhà kho')
    }
  }

  return (
    <Modal
      title="Tạo nhà kho mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên nhà kho"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên nhà kho' }]}
        >
          <Input placeholder="Ví dụ: Kho Hà Nội" />
        </Form.Item>

        <Form.Item label="Mã nhà kho (Code)" name="code">
          <Input placeholder="Ví dụ: KHO001" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải gồm 10 chữ số' }
          ]}
        >
          <Input placeholder="Số điện thoại liên hệ" />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
        >
          <Input placeholder="Địa chỉ nhà kho" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Tỉnh/Thành phố"
              name="province_id"
              rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
            >
              <Select
                placeholder="Chọn Tỉnh"
                loading={loading.provinces}
                onChange={handleProvinceChange}
              >
                {provinces.map((p) => (
                  <Select.Option key={p.code} value={p.code}>
                    {p.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Quận/Huyện"
              name="district_id"
              rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
            >
              <Select
                placeholder="Chọn Quận/Huyện"
                loading={loading.districts}
                onChange={handleDistrictChange}
                disabled={!selectedProvince}
              >
                {districts.map((d) => (
                  <Select.Option key={d.code} value={d.code}>
                    {d.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Phường/Xã"
              name="ward_id"
              rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
            >
              <Select
                placeholder="Chọn Phường/Xã"
                loading={loading.wards}
                onChange={handleWardChange}
                disabled={!selectedDistrict}
              >
                {wards.map((w) => (
                  <Select.Option key={w.code} value={w.code}>
                    {w.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
