import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ShippingAddress } from '@/types/shipping-address.type';
import { useRouter } from 'next/navigation';

interface ShippingAddressSelectionProps {
  shippingAddresses: ShippingAddress[];
  onSelectAddress: (selectedAddress: ShippingAddress) => void;
}

const ShippingAddressSelection: React.FC<ShippingAddressSelectionProps> = ({
  shippingAddresses,
  onSelectAddress,
}) => {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Memoized address calculations
  const { defaultAddress, addressesToDisplay } = useMemo(() => {
    const defaultAddr = shippingAddresses.find((address) => address.is_default);
    const displayList = defaultAddr
      ? [defaultAddr, ...shippingAddresses.filter((address) => address.id !== defaultAddr.id)]
      : shippingAddresses;
    
    return { defaultAddress: defaultAddr, addressesToDisplay: displayList };
  }, [shippingAddresses]);

  // Tự động chọn địa chỉ mặc định
  useEffect(() => {
    if (!selectedAddressId && defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
      onSelectAddress(defaultAddress);
    }
  }, [selectedAddressId, defaultAddress, onSelectAddress]);

  const handleAddressSelect = useCallback(async (address: ShippingAddress) => {
    // Animation feedback
    setIsAnimating(true);
    setSelectedAddressId(address.id);
    
    // Slight delay for better UX
    await new Promise(resolve => setTimeout(resolve, 50));
    onSelectAddress(address);
    
    // Reset animation
    setTimeout(() => setIsAnimating(false), 200);
  }, [onSelectAddress]);

  const handleAddNewAddress = useCallback(() => {
    router.push('/tai-khoan?p=address');
  }, [router]);

  // Nếu không có địa chỉ, render empty state ngay
  if (shippingAddresses.length === 0) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Chọn địa chỉ giao hàng</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Bạn chưa có địa chỉ giao hàng</p>
          <p className="text-sm text-gray-500 mb-6">Thêm địa chỉ để tiếp tục thanh toán</p>
          <button
            onClick={handleAddNewAddress}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            + Thêm địa chỉ mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Chọn địa chỉ giao hàng</h3>
        <button
          onClick={handleAddNewAddress}
          className="px-4 py-2 text-sm bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 active:scale-95 transition-all duration-200"
        >
          + Thêm mới
        </button>
      </div>

      <div className="space-y-3">
        {addressesToDisplay.map((address) => {
          const isSelected = selectedAddressId === address.id;
          const isDefault = address.is_default;
          
          return (
            <div
              key={address.id}
              onClick={() => handleAddressSelect(address)}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer
                transition-all duration-200 ease-out
                ${isAnimating && isSelected ? 'scale-[0.99]' : 'hover:scale-[0.995]'}
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                }
                active:scale-[0.99]
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              {/* Default address badge */}
              {isDefault && (
                <div className="absolute -top-2 left-4 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Mặc định
                </div>
              )}
              
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{address.name}</span>
                  <span className="text-blue-600 font-medium">•</span>
                  <span className="text-gray-700">{address.phone}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 leading-relaxed">
                {address.address}
                {address.ward && `, ${address.ward}`}
                {address.district && `, ${address.district}`}
                {address.province && `, ${address.province}`}
              </div>
              
              {address.note && (
                <div className="mt-2 text-sm text-gray-500 italic">
                  📝 {address.note}
                </div>
              )}
              
              {/* Address details footer */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {isDefault ? 'Địa chỉ mặc định' : 'Địa chỉ phụ'}
                </span>
                {isSelected && (
                  <span className="text-xs text-blue-600 font-medium animate-pulse">
                    Đang chọn ✓
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
};

export default React.memo(ShippingAddressSelection, (prevProps, nextProps) => {
  // Custom comparison để tối ưu re-render
  return (
    prevProps.shippingAddresses === nextProps.shippingAddresses &&
    prevProps.onSelectAddress === nextProps.onSelectAddress
  );
});