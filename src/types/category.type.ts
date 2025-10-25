import { Product } from "./product.type";

export interface Category {
  id: number;
  tenantId: number;
  parentId?: number | null; 
  name: string;
  slug: string;
  description?: string | null;
  thumb?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  position: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  createdAt: string;
  updatedAt: string;


  parent?: Category | null;
  children?: Category[];
  products?: Product[];
}
