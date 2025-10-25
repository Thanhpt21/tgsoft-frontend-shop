import { PayoutStatus, ReceiverType } from "@/enums/payout.enums"



export interface Payout {
  id: number
  tenantId: number
  receiverType: ReceiverType
  receiverId?: number | null
  amount: number
  currency: string
  status: PayoutStatus
  method?: string | null
  reference?: string | null
  createdBy?: number | null
  createdAt: string
  processedAt?: string | null
}
