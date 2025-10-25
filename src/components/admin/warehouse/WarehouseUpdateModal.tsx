'use client'

import { Modal, Form, Input, Button, Select, Row, Col, message, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { useUpdateWarehouse } from '@/hooks/warehouse/useUpdateWarehouse'
import { District, Province, Ward } from '@/types/address.type'
import { Warehouse } from '@/types/warehouse.type'

interface WarehouseUpdateModalProps {
  open: boolean
  onClose: () => void
  warehouse: Warehouse | null
  refetch?: () => void
}

export const WarehouseUpdateModal = ({ open, onClose, warehouse, refetch }: WarehouseUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateWarehouse()

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

  useEffect(() => {
    if (warehouse) {
      // Set selected values for province, district, and ward when warehouse is provided
      const { location } = warehouse
      if (location) {
        setSelectedProvince(location.province_id)
        setSelectedDistrict(location.district_id)
        setSelectedWard(location.ward_id)

        // Fetch the districts and wards based on the warehouse's location
        fetchDistricts(location.province_id)
        fetchWards(location.district_id)

        form.setFieldsValue({
          name: warehouse.name,
          code: warehouse.code || '',
          phone: location.phone || '',
          address: location.address || '',
          province_id: location.province_id,
          district_id: location.district_id,
          ward_id: location.ward_id,
        })
      }
    }
  }, [warehouse, open, form])

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
    setDistricts([])  // Reset districts and wards when province changes
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
    setWards([]) // Reset wards when district changes
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
        district_id: '',
        ward_id: '',
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
        ward_id: '',
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

      await mutateAsync({ id: warehouse?.id || '', data: data })
      message.success('Cập nhật nhà kho thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (err) {
      message.error('Lỗi cập nhật nhà kho')
    }
  }

  return (
    <Modal
      title={`Cập nhật nhà kho: ${warehouse?.name || ''}`}
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
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }, { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải gồm 10 chữ số' }]}
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
                value={selectedProvince}
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
                value={selectedDistrict}
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
                value={selectedWard}
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
