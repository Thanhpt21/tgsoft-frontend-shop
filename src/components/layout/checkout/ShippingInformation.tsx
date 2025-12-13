'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ShippingAddress } from '@/types/shipping-address.type'

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
  // State management
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  
  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [selectedWard, setSelectedWard] = useState<string>('')
  
  const [loading, setLoading] = useState({ provinces: false, districts: false, wards: false })
  const [formValues, setFormValues] = useState<ShippingAddress>(shippingInfo)

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(prev => ({ ...prev, provinces: true }))
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout
        
        const res = await fetch('https://provinces.open-api.vn/api/p/', {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        })
        
        clearTimeout(timeoutId)
        
        if (res.ok) {
          const data: Province[] = await res.json()
          setProvinces(data)
          // Cache in localStorage
          try {
            localStorage.setItem('provinces_cache', JSON.stringify({
              data,
              timestamp: Date.now()
            }))
          } catch (e) {
            // Ignore localStorage errors
          }
        }
      } catch (error) {
        console.warn('Không thể tải danh sách tỉnh/thành phố')
        
        // Try to load from cache
        try {
          const cached = localStorage.getItem('provinces_cache')
          if (cached) {
            const { data, timestamp } = JSON.parse(cached)
            // Cache valid for 24 hours
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
              setProvinces(data)
            }
          }
        } catch (e) {
          // Ignore cache errors
        }
      } finally {
        setLoading(prev => ({ ...prev, provinces: false }))
      }
    }
    
    fetchProvinces()
  }, [])

  // Sync form values with parent
  useEffect(() => {
    setFormValues(shippingInfo)
    
    // Pre-select province/district/ward if they exist
    if (shippingInfo.province_id) {
      setSelectedProvince(shippingInfo.province_id.toString())
    }
    if (shippingInfo.district_id) {
      setSelectedDistrict(shippingInfo.district_id.toString())
    }
    if (shippingInfo.ward_id) {
      setSelectedWard(shippingInfo.ward_id.toString())
    }
  }, [shippingInfo])

  // Fetch districts
  const fetchDistricts = useCallback(async (provinceCode: string) => {
    setLoading(prev => ({ ...prev, districts: true }))
    setDistricts([])
    setWards([])
    setSelectedDistrict('')
    setSelectedWard('')
    
    try {
      const cacheKey = `districts_${provinceCode}`
      
      // Check cache first
      try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            setDistricts(data)
            setLoading(prev => ({ ...prev, districts: false }))
            return
          }
        }
      } catch (e) {
        // Ignore cache errors
      }
      
      // Fetch from API
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (res.ok) {
        const data = await res.json()
        const districtsData = data.districts || []
        setDistricts(districtsData)
        
        // Cache result
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: districtsData,
            timestamp: Date.now()
          }))
        } catch (e) {
          // Ignore cache errors
        }
      }
    } catch (error) {
      console.warn('Không thể tải danh sách quận/huyện')
    } finally {
      setLoading(prev => ({ ...prev, districts: false }))
    }
  }, [])

  // Fetch wards
  const fetchWards = useCallback(async (districtCode: string) => {
    setLoading(prev => ({ ...prev, wards: true }))
    setWards([])
    setSelectedWard('')
    
    try {
      const cacheKey = `wards_${districtCode}`
      
      // Check cache first
      try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            setWards(data)
            setLoading(prev => ({ ...prev, wards: false }))
            return
          }
        }
      } catch (e) {
        // Ignore cache errors
      }
      
      // Fetch from API
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (res.ok) {
        const data = await res.json()
        const wardsData = data.wards || []
        setWards(wardsData)
        
        // Cache result
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: wardsData,
            timestamp: Date.now()
          }))
        } catch (e) {
          // Ignore cache errors
        }
      }
    } catch (error) {
      console.warn('Không thể tải danh sách phường/xã')
    } finally {
      setLoading(prev => ({ ...prev, wards: false }))
    }
  }, [])

  // Memoized event handlers
  const handleProvinceChange = useCallback((value: string) => {
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
  }, [provinces, formValues, setShippingInfo, fetchDistricts])

  const handleDistrictChange = useCallback((value: string) => {
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
  }, [districts, formValues, setShippingInfo, fetchWards])

  const handleWardChange = useCallback((value: string) => {
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
  }, [wards, formValues, setShippingInfo])

  const handleInputChange = useCallback((field: keyof ShippingAddress, value: string) => {
    const newValues = { ...formValues, [field]: value }
    setFormValues(newValues)
    setShippingInfo(newValues)
  }, [formValues, setShippingInfo])

  const handleUpdate = useCallback(() => {
    const { name, phone, address, province_id, district_id, ward_id } = formValues

    if (!name?.trim() || !phone?.trim() || !address?.trim() || !province_id || !district_id || !ward_id) {
      // Show inline validation
      const errorFields = []
      if (!name?.trim()) errorFields.push('Họ tên')
      if (!phone?.trim()) errorFields.push('Số điện thoại')
      if (!address?.trim()) errorFields.push('Địa chỉ chi tiết')
      if (!province_id) errorFields.push('Tỉnh/Thành phố')
      if (!district_id) errorFields.push('Quận/Huyện')
      if (!ward_id) errorFields.push('Phường/Xã')
      
      // Add visual feedback
      const formEl = document.querySelector('.shipping-form')
      if (formEl) {
        formEl.classList.add('shake')
        setTimeout(() => formEl.classList.remove('shake'), 500)
      }
      
      return
    }
    
    onShippingInfoUpdate(formValues)
  }, [formValues, onShippingInfoUpdate])

  // Memoized select options
  const provinceOptions = useMemo(() => 
    provinces.map(p => ({ value: p.code, label: p.name })),
    [provinces]
  )
  
  const districtOptions = useMemo(() => 
    districts.map(d => ({ value: d.code, label: d.name })),
    [districts]
  )
  
  const wardOptions = useMemo(() => 
    wards.map(w => ({ value: w.code, label: w.name })),
    [wards]
  )

  // Search filter function
  const filterOption = useCallback((input: string, option: { label: string; value: string }) => {
    return option.label.toLowerCase().includes(input.toLowerCase())
  }, [])

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 shipping-form">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">Thông tin giao hàng</h3>
      </div>

      <div className="space-y-6">
        {/* Name and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formValues.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formValues.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="0987654321"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Address Details */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Địa chỉ chi tiết <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formValues.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Số nhà, tên đường, tòa nhà, ..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
          />
        </div>

        {/* Location Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Province */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedProvince}
                onChange={(e) => handleProvinceChange(e.target.value)}
                disabled={loading.provinces}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition-all duration-200 bg-white"
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {provinceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {loading.provinces ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* District */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Quận/Huyện <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!selectedProvince || loading.districts}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition-all duration-200 ${
                  !selectedProvince ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">Chọn quận/huyện</option>
                {districtOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {loading.districts ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Ward */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Phường/Xã <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedWard}
                onChange={(e) => handleWardChange(e.target.value)}
                disabled={!selectedDistrict || loading.wards}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition-all duration-200 ${
                  !selectedDistrict ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">Chọn phường/xã</option>
                {wardOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {loading.wards ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Ghi chú (tùy chọn)
          </label>
          <textarea
            value={formValues.note || ''}
            onChange={(e) => handleInputChange('note', e.target.value)}
            placeholder="Hướng dẫn giao hàng, thời gian nhận hàng, ..."
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
          />
        </div>

        {/* Update Button */}
        <div className="pt-4">
          <button
            onClick={handleUpdate}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Cập nhật thông tin
          </button>
        </div>
      </div>

      {/* Validation indicator */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-600">
            Vui lòng điền đầy đủ thông tin bắt buộc (<span className="text-red-500">*</span>) để tiếp tục
          </p>
        </div>
      </div>

      {/* Add CSS for shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default React.memo(ShippingInformation, (prevProps, nextProps) => {
  // Only re-render if shippingInfo actually changes
  return (
    prevProps.shippingInfo === nextProps.shippingInfo &&
    prevProps.onShippingInfoUpdate === nextProps.onShippingInfoUpdate
  )
})