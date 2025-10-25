// src/types/ghtk.type.ts

export interface CalculateFeeDto {
  pick_province: string
  pick_district: string
  pick_ward?: string | null
  pick_address?: string | null
  province: string
  district: string
  ward?: string | null
  address?: string | null
  weight: number
  value?: number
  deliver_option?: 'none' | 'xteam'
  transport?: 'road' | 'fly'
}

export interface GHTKRawFeeContent {
  name: string
  fee: number
  insurance_fee: number
  include_vat: number
  cost_id: number
  delivery_type: string
  a: number
  dt: string
  extFees: any[]
  promotion_key: string
  delivery: boolean
  ship_fee_only: number
  distance: number
  options: {
    name: string
    title: string
    shipMoney: number
    shipMoneyText: string
    vatText: string
    desc: string
    coupon: string
    maxUses: number
    maxDates: number
    maxDateString: string
    content: string
    activatedDate: string
    couponTitle: string
    discount: string
    couponId: number
  }
}

export interface GHTKInternalFeeResponse {
  success: boolean
  message?: string
  fee?: GHTKRawFeeContent
}

export interface GHTKRawFeeResponse {
  success: boolean
  message?: string
  fee?: GHTKInternalFeeResponse
  reason?: string
}

export interface GHTKFeeDetails {
  name: string
  fee: number
  insurance_fee: number
  extra_fee: {
    pickup_fee: number
    return_fee: number
  }
}

export interface GHTKShipFeeResponse {
  success: boolean
  message?: string
  fee?: GHTKFeeDetails
  reason?: string
}

export interface GHTKCreateOrderResponse {
  success: boolean
  message?: string
  order?: {
    partner_id: string
    label: string
    area: string
    fee: number
    insurance_fee: number
    created: string
    status?: string
    tracking_link?: string
  }
  reason?: string
}

export interface GHTKProvinceResponse {
  success: boolean
  message?: string
  data: {
    ProvinceID: number
    ProvinceName: string
  }[]
}

export interface GHTKDistrictResponse {
  success: boolean
  message?: string
  data: {
    DistrictID: number
    DistrictName: string
    ProvinceID: number
  }[]
}

export interface GHTKWardResponse {
  success: boolean
  message?: string
  data: {
    WardID: number
    WardName: string
    DistrictID: number
  }[]
}

export interface GHTKTrackingResponse {
  success: boolean
  message?: string
  order?: {
    label: string
    partner_id: string
    status: number
    status_text: string
  }
  reason?: string
}

export interface GHTKCancelOrderResponse {
  success: boolean
  message?: string
  reason?: string
}
