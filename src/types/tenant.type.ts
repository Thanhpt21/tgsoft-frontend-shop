export interface Tenant {
  id: number
  name: string
  slug: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TenantResponse {
  data: Tenant[]
  total: number
  page: number
  pageCount: number
}