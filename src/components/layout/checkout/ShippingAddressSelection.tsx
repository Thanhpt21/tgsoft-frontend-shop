import { Typography, Space, Tag, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import { ShippingAddress } from '@/types/shipping-address.type';
import { CheckOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

interface ShippingAddressSelectionProps {
  shippingAddresses: ShippingAddress[];
  onSelectAddress: (selectedAddress: ShippingAddress) => void;
}

const ShippingAddressSelection: React.FC<ShippingAddressSelectionProps> = ({
  shippingAddresses,
  onSelectAddress,
}) => {
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const router = useRouter();

  // Tìm địa chỉ mặc định nếu có
  const defaultAddress = shippingAddresses.find((address) => address.is_default);
  const addressesToDisplay = defaultAddress
    ? [defaultAddress, ...shippingAddresses.filter((address) => address.id !== defaultAddress.id)]
    : shippingAddresses;

  // Tự động chọn địa chỉ mặc định khi mới vào
  useEffect(() => {
    if (!selectedAddressId && defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
      onSelectAddress(defaultAddress);
    }
  }, [selectedAddressId, defaultAddress, onSelectAddress]);

  const handleAddressSelect = (address: ShippingAddress) => {
    setSelectedAddressId(address.id);
    onSelectAddress(address);
  };

  const handleAddNewAddress = () => {
    router.push('/tai-khoan?p=address');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <Typography.Title level={5} className="mb-4">
        Chọn địa chỉ giao hàng
      </Typography.Title>

      {/* Nút thêm địa chỉ mới */}
      <Button type="primary" className="mb-4" onClick={handleAddNewAddress}>
        Thêm địa chỉ mới
      </Button>

      {/* Trường hợp chưa có địa chỉ nào */}
      {shippingAddresses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Bạn chưa có địa chỉ giao hàng nào.</p>
          <p className="text-sm mt-2">Vui lòng thêm địa chỉ để tiếp tục.</p>
        </div>
      ) : (
        <Space direction="vertical" className="w-full" size="middle">
          {addressesToDisplay.map((address) => (
            <div
              key={address.id}
              className={`w-full p-4 rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
                selectedAddressId === address.id ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleAddressSelect(address)}
            >
              <div className="flex justify-between items-center">
                <div className="font-semibold text-base">{address.name}</div>
                {address.is_default && (
                  <Tag color="green" icon={<CheckOutlined />} className="text-sm">
                    Mặc định
                  </Tag>
                )}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {address.address}
                {address.ward && `, ${address.ward}`}
                {address.district && `, ${address.district}`}
                {address.province && `, ${address.province}`}
              </div>
              {address.note && (
                <div className="text-sm text-gray-500 mt-1">Ghi chú: {address.note}</div>
              )}
            </div>
          ))}
        </Space>
      )}
    </div>
  );
};

export default ShippingAddressSelection;