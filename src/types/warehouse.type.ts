// @/types/warehouse.type.ts

export interface Warehouse {
  id: number;
  tenantId: number;
  code?: string;
  name: string;
  location?: any; 
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseDto {
  code?: string;
  name: string;
  location?: any; 
}

export interface UpdateWarehouseDto {
  code?: string;
  name?: string;
  location?: any; 
}