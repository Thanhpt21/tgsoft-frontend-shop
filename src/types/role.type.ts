export interface Role {
  id: number
  name: 'admin' | 'customer' | 'staff' | 'manager'
  description: string
  createdAt?: string
  updatedAt?: string
}