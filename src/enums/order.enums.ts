export enum OrderStatus {
  DRAFT = 'DRAFT',
  PAID_PENDING = 'PAID_PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum DeliveryMethod {
  STANDARD = 'STANDARD',
  XTEAM = 'XTEAM',
}