// types/product-attribute.type.ts

export interface ProductAttribute {
  productId: number;
  attributeId: number;
  createdAt: string; 
  updatedAt: string;


  attribute?: {
    id: number;
    name: string;
  };
  product?: {
    id: number;
    name: string;

  };
}
