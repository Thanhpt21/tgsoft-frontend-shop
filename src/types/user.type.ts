export interface Role {
  id: number
  name: string
  description?: string
}

export interface UserTenantRole {
  tenantId: number
  role: Role
}

export interface User {
  id: number
  name: string
  email: string
  password?: string
  role: string // global role, ví dụ 'admin', 'user'
  phone?: string | null
  gender?: 'male' | 'female' | 'other' | null
  avatar?: string | null
  isActive: boolean
  type_account: 'normal' | 'google' | 'facebook' | string
  tenantId?: number | null // ✅ thêm để đồng bộ backend
  createdAt: string
  updatedAt: string

  // ✅ thêm quan hệ nếu bạn muốn lấy role theo tenant
  userTenantRoles?: UserTenantRole[]
}

export interface LoginResponse {
  user: User
  access_token: string
}
