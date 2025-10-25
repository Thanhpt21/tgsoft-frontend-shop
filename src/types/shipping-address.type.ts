export interface ShippingAddress {
  name: string
  phone: string
  address: string
  ward_id?: number
  district_id?: number
  province_id?: number
  city_id?: number
  ward_name?: string // Tên phường/xã
  district_name?: string // Tên quận/huyện
  province_name?: string // Tên tỉnh/thành phố
  city_name?: string // Tên thành phố
  note?: string
}
