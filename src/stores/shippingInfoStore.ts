import { create } from 'zustand';

interface ShippingInfoState {
  name: string;
  phone: string;
  address: string;
  ward: string | null;
  district: string | null;
  province: string | null;
  selectedSavedAddressId: number | null; // Thêm state này
  setName: (name: string) => void;
  setPhone: (phone: string) => void;
  setAddress: (address: string) => void;
  setWard: (ward: string | null) => void;
  setDistrict: (district: string | null) => void;
  setProvince: (province: string | null) => void;
  setSelectedSavedAddressId: (id: number | null) => void; // Thêm setter này
  reset: () => void;
}

const useShippingInfo = create<ShippingInfoState>((set) => ({
  name: '',
  phone: '',
  address: '',
  ward: null,
  district: null,
  province: null,
  selectedSavedAddressId: null, // Giá trị ban đầu là null
  setName: (name) => set({ name }),
  setPhone: (phone) => set({ phone }),
  setAddress: (address) => set({ address }),
  setWard: (ward) => set({ ward }),
  setDistrict: (district) => set({ district }),
  setProvince: (province) => set({ province }),
  setSelectedSavedAddressId: (id) => set({ selectedSavedAddressId: id }), // Implement setter
  reset: () =>
    set({
      name: '',
      phone: '',
      address: '',
      ward: null,
      district: null,
      province: null,
      selectedSavedAddressId: null, // Reset cả selected ID
    }),
}));

export default useShippingInfo;