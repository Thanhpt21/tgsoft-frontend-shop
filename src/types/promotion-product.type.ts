import { Product } from "./product.type";

export enum DiscountType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}



export interface PromotionProduct {
  id: number;
  promotionId: number;
  productId: number;
  product: Product;
  discountType: DiscountType;
  discountValue: number;
  giftProductId?: number | null;
  giftQuantity?: number | null;
  saleQuantity?: number;
  createdAt: string;
  updatedAt: string;
  promotion: {
    id: number;
    name: string;
    description: string;
    endTime: string,
    startTime: string
  };
  giftProduct?: {
    id: number;
    name: string;
    thumb?: string | null;
  } | null;
}