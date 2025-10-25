export interface AttributeValue {
  id: number
  attributeId: number
  value: string
  createdAt: string 
  updatedAt: string 
}

export interface AttributeValueListResponse {
  data: AttributeValue[]
  total: number
  page: number
  pageCount: number
}
