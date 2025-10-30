// src/types/shipping-address.type.ts

export interface ShippingAddress {
  id: number;
  tenantId: number;
  userId: number | null;  // userId có thể là null nếu không có người dùng
  name: string;
  phone: string;
  address: string;
  note?: string;  // Note là trường tùy chọn
  province_id: number | undefined;  // Sử dụng snake_case cho các trường
  province: string;
  district_id: number | undefined;
  district: string;
  ward_id: number | undefined;
  ward: string;
  province_name?: string;  // Tên tỉnh (nullable)
  district_name?: string;  // Tên quận (nullable)
  ward_name?: string;  // Tên phường (nullable)
  city_name?: string;
  is_default: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface CreateShippingAddressDto {
  name: string;
  phone: string;
  address: string;
  note?: string;  // Trường này là tùy chọn
  province_id: number;  // Dùng snake_case cho tất cả các trường
  province: string;
  district_id: number;
  district: string;
  ward_id: number;
  ward: string;
  is_default?: boolean;  // Trường này có thể không có khi tạo mới
}

export interface UpdateShippingAddressDto {
  name?: string;
  phone?: string;
  address?: string;
  note?: string;  // Trường này là tùy chọn
  province_id?: number;  // Cập nhật các trường với snake_case
  province?: string;
  district_id?: number;
  district?: string;
  ward_id?: number;
  ward?: string;
  is_default?: boolean;
}

