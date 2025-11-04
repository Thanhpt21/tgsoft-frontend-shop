export enum PromotionStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
}

export interface Promotion {
  id: number
  tenantId: number
  name: string
  description: string
  startTime: string
  endTime: string
  status: PromotionStatus
  isFlashSale: boolean
  repeatCount: number
  createdAt: string
  updatedAt: string
}
