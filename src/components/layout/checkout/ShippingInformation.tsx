  'use client'

  import React, { useState, useEffect } from 'react'
  import { Input, Row, Col, Typography, Select, message, Button } from 'antd'
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

    // **New state to store current form values**
    const [formValues, setFormValues] = useState<ShippingAddress>(shippingInfo)

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
          province_name: province.name, // Lưu tên tỉnh
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
          district_name: district.name, // Lưu tên quận
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
          ward_name: ward.name, // Lưu tên phường
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

    // **Handle update button click**
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

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Input placeholder="Họ và tên" value={formValues.name} onChange={(e) => handleChange('name', e.target.value)} />
          </Col>
          <Col xs={24} md={12}>
            <Input placeholder="Số điện thoại" value={formValues.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          </Col>
        </Row>

          <Row>
          <Col span={24}>
             <Input.TextArea placeholder="Địa chỉ chi tiết (số nhà, tên đường...)" rows={3} value={formValues.address} onChange={(e) => handleChange('address', e.target.value)} />
          </Col>
      
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Select showSearch placeholder="Chọn Tỉnh/Thành phố" style={{ width: '100%' }}
              value={selectedProvince || undefined} onChange={handleProvinceChange} loading={loading.provinces} filterOption={(input, option) => String(option?.children || '').toLowerCase().includes(input.toLowerCase())}>
              {provinces.map(p => <Option key={p.code} value={p.code}>{p.name}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Select showSearch placeholder="Chọn Quận/Huyện" style={{ width: '100%' }}
              value={selectedDistrict || undefined} onChange={handleDistrictChange} loading={loading.districts} disabled={!selectedProvince} filterOption={(input, option) => String(option?.children || '').toLowerCase().includes(input.toLowerCase())}>
              {districts.map(d => <Option key={d.code} value={d.code}>{d.name}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Select showSearch placeholder="Chọn Phường/Xã" style={{ width: '100%' }}
              value={selectedWard || undefined} onChange={handleWardChange} loading={loading.wards} disabled={!selectedDistrict} filterOption={(input, option) => String(option?.children || '').toLowerCase().includes(input.toLowerCase())}>
              {wards.map(w => <Option key={w.code} value={w.code}>{w.name}</Option>)}
            </Select>
          </Col>
        </Row>

      
        <Row>
          <Col span={24}>
               <Input.TextArea placeholder="Ghi chú (tùy chọn)" rows={3} value={formValues.note} onChange={(e) => handleChange('note', e.target.value)} />
          </Col>
      
        </Row>

      </div>
    )
  }

  export default ShippingInformation
