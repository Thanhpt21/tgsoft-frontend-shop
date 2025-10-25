// payment.type.ts

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED'; // Modify based on actual statuses

export type PaymentMethod = {
  id: number;
  tenantId: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type ProviderData = {
  payDate: string;
  bankCode: string;
};

export type Refund = {
  id: number;
  paymentId: number;
  amount: number;
  status: string; // You can further define the status type if needed
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: number;
  orderId: number;
  order: Order; // Order type (you can define this based on your Order model)
  tenantId: number;
  tenant: Tenant; // Tenant type (you can define this based on your Tenant model)
  methodId: number;
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transactionId?: string;
  providerData?: ProviderData;
  createdAt: string;
  updatedAt: string;
  refunds: Refund[];
};

export type Order = {
  id: number;
  // Add other fields of Order model based on your actual schema
};

export type Tenant = {
  id: number;
  // Add other fields of Tenant model based on your actual schema
};
