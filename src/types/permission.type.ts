export interface Permission {
  id: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface PermissionResponse {
  data: Permission[]
  total: number
  page: number
  pageCount: number
}