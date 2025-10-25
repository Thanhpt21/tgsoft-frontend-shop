import { create } from 'zustand';

interface ShippingMethodState {
  selectedShippingMethod: string | null; // 'standard', 'express', hoặc tên tỉnh
  shippingFee: number | null;
  setSelectedShippingMethod: (method: string | null) => void;
  setShippingFee: (fee: number | null) => void;
}

const useShippingMethod = create<ShippingMethodState>((set) => ({
  selectedShippingMethod: null,
  shippingFee: null,
  setSelectedShippingMethod: (method) => set({ selectedShippingMethod: method }),
  setShippingFee: (fee) => set({ shippingFee: fee }),
}));

export default useShippingMethod;