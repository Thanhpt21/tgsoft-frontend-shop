export interface Config {
  id: number
  tenantId: number
  name?: string | null
  email?: string | null
  mobile?: string | null
  address?: string | null
  googlemap?: string | null
  facebook?: string | null
  zalo?: string | null
  instagram?: string | null
  tiktok?: string | null
  youtube?: string | null
  x?: string | null
  linkedin?: string | null
  logo?: string | null
  createdAt: string // hoặc Date nếu parse về Date object
  updatedAt: string
}

export interface CreateConfigDto {
  name?: string
  email?: string
  mobile?: string
  address?: string
  googlemap?: string
  facebook?: string
  zalo?: string
  instagram?: string
  tiktok?: string
  youtube?: string
  x?: string
  linkedin?: string
  // logo sẽ gửi qua FormData, không cần trong DTO
}

export interface UpdateConfigDto {
  name?: string
  email?: string
  mobile?: string
  address?: string
  googlemap?: string
  facebook?: string
  zalo?: string
  instagram?: string
  tiktok?: string
  youtube?: string
  x?: string
  linkedin?: string
  // logo cũng gửi qua FormData khi update
}