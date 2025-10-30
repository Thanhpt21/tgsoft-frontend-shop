'use client'

import React, { useState, useEffect } from 'react'
import { Input, Row, Col, Typography, Select, message, Button, Form } from 'antd'
import { ShippingAddress } from '@/types/shipping-address.type'

const { Title } = Typography
const { Option } = Select

interface Province { code: string; name: string }
interface District { code: string; name: string }
interface Ward { code: string; name: string }

interface ShippingInformationProps {
  shippingInfo: ShippingAddress
  setShippingInfo: React.Dispatch<React.SetStateAction<ShippingAddress>>
  onShippingInfoUpdate: (updatedShippingInfo: ShippingAddress) => void;
}

const ShippingInformation: React.FC<ShippingInformationProps> = ({
  shippingInfo,
  setShippingInfo,
  onShippingInfoUpdate,
}) => {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])

  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [selectedWard, setSelectedWard] = useState<string>('')

  const [loading, setLoading] = useState({ provinces: false, districts: false, wards: false })

  const [formValues, setFormValues] = useState<ShippingAddress>(shippingInfo)

  useEffect(() => {
    setFormValues(shippingInfo) 
  }, [shippingInfo])

  useEffect(() => { fetchProvinces() }, [])

  const fetchProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }))
    try {
      const res = await fetch('https://provinces.open-api.vn/api/p/')
      const data: Province[] = await res.json()
      setProvinces(data)
    } catch (error) { message.error('Không thể tải danh sách tỉnh/thành phố') }
    finally { setLoading(prev => ({ ...prev, provinces: false })) }
  }

  const fetchDistricts = async (provinceCode: string) => {
    setLoading(prev => ({ ...prev, districts: true }))
    setDistricts([]); setWards([]); setSelectedDistrict(''); setSelectedWard('')
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
      const data = await res.json()
      setDistricts(data.districts || [])
    } catch (error) { message.error('Không thể tải danh sách quận/huyện') }
    finally { setLoading(prev => ({ ...prev, districts: false })) }
  }

  const fetchWards = async (districtCode: string) => {
    setLoading(prev => ({ ...prev, wards: true }))
    setWards([]); setSelectedWard('')
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
      const data = await res.json()
      setWards(data.wards || [])
    } catch (error) { message.error('Không thể tải danh sách phường/xã') }
    finally { setLoading(prev => ({ ...prev, wards: false })) }
  }

  const handleProvinceChange = (value: string) => {
    const province = provinces.find(p => p.code === value)
    if (province) {
      setSelectedProvince(value)
      const newValues = {
        ...formValues,
        province: province.name, 
        province_id: Number(value),
        district: '', 
        district_id: 0,
        ward: '', 
        ward_id: 0,
        province_name: province.name,
      }
      setFormValues(newValues)
      setShippingInfo(newValues)
      fetchDistricts(value)
    }
  }

  const handleDistrictChange = (value: string) => {
    const district = districts.find(d => d.code === value)
    if (district) {
      setSelectedDistrict(value)
      const newValues = {
        ...formValues,
        district: district.name, 
        district_id: Number(value),
        ward: '', 
        ward_id: 0,
        district_name: district.name,
      }
      setFormValues(newValues)
      setShippingInfo(newValues)
      fetchWards(value)
    }
  }

  const handleWardChange = (value: string) => {
    const ward = wards.find(w => w.code === value)
    if (ward) {
      setSelectedWard(value)
      const newValues = {
        ...formValues,
        ward: ward.name, 
        ward_id: Number(value),
        ward_name: ward.name,
      }
      setFormValues(newValues)
      setShippingInfo(newValues)
    }
  }

  const handleChange = (field: keyof ShippingAddress, value: any) => {
    const newValues = { ...formValues, [field]: value }
    setFormValues(newValues)
    setShippingInfo(newValues)
  }

  const handleUpdate = () => {
    const { name, phone, address, province_id, district_id, ward_id } = formValues

    if (!name || !phone || !address || !province_id || !district_id || !ward_id) {
      message.warning('Vui lòng điền đầy đủ thông tin giao hàng (Họ tên, SĐT, địa chỉ, Tỉnh/Quận/Xã).')
      return
    }
    onShippingInfoUpdate(formValues)
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
      <Title level={4}>Thông tin giao hàng</Title>

      <Form layout="vertical" onFinish={handleUpdate}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item 
              label="Họ và tên" 
              name="name" 
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input placeholder="Họ và tên" value={formValues.name} onChange={(e) => handleChange('name', e.target.value)} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item 
              label="Số điện thoại" 
              name="phone" 
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="Số điện thoại" value={formValues.phone} onChange={(e) => handleChange('phone', e.target.value)} />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item 
              label="Địa chỉ chi tiết" 
              name="address" 
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
            >
              <Input.TextArea placeholder="Địa chỉ chi tiết (số nhà, tên đường...)" rows={3} value={formValues.address} onChange={(e) => handleChange('address', e.target.value)} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item 
              label="Tỉnh/Thành phố" 
              name="province" 
              rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
            >
              <Select showSearch placeholder="Chọn Tỉnh/Thành phố" style={{ width: '100%' }}
                value={selectedProvince || undefined} onChange={handleProvinceChange} loading={loading.provinces}
                filterOption={(input, option) => String(option?.children || '').toLowerCase().includes(input.toLowerCase())}>
                {provinces.map(p => <Option key={p.code} value={p.code}>{p.name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item 
              label="Quận/Huyện" 
              name="district" 
              rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
            >
              <Select showSearch placeholder="Chọn Quận/Huyện" style={{ width: '100%' }}
                value={selectedDistrict || undefined} onChange={handleDistrictChange} loading={loading.districts} disabled={!selectedProvince}
                filterOption={(input, option) => String(option?.children || '').toLowerCase().includes(input.toLowerCase())}>
                {districts.map(d => <Option key={d.code} value={d.code}>{d.name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item 
              label="Phường/Xã" 
              name="ward" 
              rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
            >
              <Select showSearch placeholder="Chọn Phường/Xã" style={{ width: '100%' }}
                value={selectedWard || undefined} onChange={handleWardChange} loading={loading.wards} disabled={!selectedDistrict}
                filterOption={(input, option) => String(option?.children || '').toLowerCase().includes(input.toLowerCase())}>
                {wards.map(w => <Option key={w.code} value={w.code}>{w.name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item 
              label="Ghi chú" 
              name="note"
            >
              <Input.TextArea placeholder="Ghi chú (tùy chọn)" rows={3} value={formValues.note} onChange={(e) => handleChange('note', e.target.value)} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default ShippingInformation
