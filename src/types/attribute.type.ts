export interface Attribute {
  id: number
  name: string
  position: number
  tenantId: number
  createdAt: string // hoặc Date nếu bạn muốn parse về Date
  updatedAt: string // hoặc Date
}

export interface AttributeListResponse {
  data: Attribute[]
  total: number
  page: number
  pageCount: number
}

