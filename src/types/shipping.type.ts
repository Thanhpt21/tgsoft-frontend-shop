export interface Shipping {
  id: number;
  provinceName: string;
  fee: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingResponse {
  success: boolean;
  message: string;
  data: Shipping[];
  total: number;
  page: number;
  pageCount: number;
}