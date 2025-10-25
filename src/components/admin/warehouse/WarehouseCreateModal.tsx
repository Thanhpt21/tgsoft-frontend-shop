'use client'

import { Modal, Form, Input, Button, Select, Row, Col, message, Spin } from 'antd'
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
    }
  }, [open])

  const fetchProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }))
    try {
      const res = await fetch('https://provinces.open-api.vn/api/p/')
      const data: Province[] = await res.json()
      setProvinces(data)
    } catch (error) {
      message.error('Không thể tải danh sách tỉnh/thành phố')
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }))
    }
  }

  const fetchDistricts = async (provinceCode: string) => {
    setLoading(prev => ({ ...prev, districts: true }))
    setDistricts([])
    setWards([])
    setSelectedDistrict('')
    setSelectedWard('')
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
      const data = await res.json()
      setDistricts(data.districts || [])
    } catch (error) {
      message.error('Không thể tải danh sách quận/huyện')
    } finally {
      setLoading(prev => ({ ...prev, districts: false }))
    }
  }

  const fetchWards = async (districtCode: string) => {
    setLoading(prev => ({ ...prev, wards: true }))
    setWards([])
    setSelectedWard('')
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
      const data = await res.json()
      setWards(data.wards || [])
    } catch (error) {
      message.error('Không thể tải danh sách phường/xã')
    } finally {
      setLoading(prev => ({ ...prev, wards: false }))
    }
  }

  const handleProvinceChange = (value: string) => {
    const province = provinces.find(p => p.code === value)
    if (province) {
      setSelectedProvince(value)
      form.setFieldsValue({
        province_id: value,
        district: '',
        ward: '',
      })
      fetchDistricts(value)
    }
  }

  const handleDistrictChange = (value: string) => {
    const district = districts.find(d => d.code === value)
    if (district) {
      setSelectedDistrict(value)
      form.setFieldsValue({
        district_id: value,
        ward: '',
      })
      fetchWards(value)
    }
  }

  const handleWardChange = (value: string) => {
    setSelectedWard(value)
    form.setFieldsValue({ ward_id: value })
  }

  const onFinish = async (values: any) => {
    try {
      const selectedProvinceDetails = provinces.find(p => p.code === values.province_id)
      const selectedDistrictDetails = districts.find(d => d.code === values.district_id)
      const selectedWardDetails = wards.find(w => w.code === values.ward_id)

      const location = {
        name: values.name,
        phone: values.phone || undefined,
        address: values.address,
        province_id: values.province_id,
        province_name: selectedProvinceDetails?.name,
        district_id: values.district_id,
        district_name: selectedDistrictDetails?.name,
        ward_id: values.ward_id,
        ward_name: selectedWardDetails?.name,
      }

      const data = {
        name: values.name,
        code: values.code || undefined,
        location: location,
      }

      await mutateAsync(data)
      message.success('Tạo nhà kho thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (err) {
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
          rules={[{ required: true, message: 'Vui lòng nhập tên nhà kho' }, { min: 2, message: 'Tên phải có ít nhất 2 ký tự' }]}
        >
          <Input placeholder="Ví dụ: Kho Hà Nội" />
        </Form.Item>

        <Form.Item
          label="Mã nhà kho (Code)"
          name="code"
          rules={[{ max: 10, message: 'Mã không được vượt quá 10 ký tự' }]}
          tooltip="Mã định danh duy nhất (tùy chọn)"
        >
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
              rules={[{ required: true, message: 'Vui lòng chọn tỉnh thành' }]}
            >
              <Select
                placeholder="Chọn Tỉnh"
                loading={loading.provinces}
                onChange={handleProvinceChange}
              >
                {provinces.map((province) => (
                  <Select.Option key={province.code} value={province.code}>
                    {province.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Quận/Huyện"
              name="district_id"
              rules={[{ required: true, message: 'Vui lòng chọn quận huyện' }]}
            >
              <Select
                placeholder="Chọn Quận"
                loading={loading.districts}
                onChange={handleDistrictChange}
                disabled={!selectedProvince}
              >
                {districts.map((district) => (
                  <Select.Option key={district.code} value={district.code}>
                    {district.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Phường/Xã"
              name="ward_id"
              rules={[{ required: true, message: 'Vui lòng chọn phường xã' }]}
            >
              <Select
                placeholder="Chọn Phường"
                loading={loading.wards}
                onChange={handleWardChange}
                disabled={!selectedDistrict}
              >
                {wards.map((ward) => (
                  <Select.Option key={ward.code} value={ward.code}>
                    {ward.name}
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
