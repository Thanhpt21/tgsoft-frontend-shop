import { Spin, Typography, Space, Tag, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import { ShippingAddress } from '@/types/shipping-address.type';
import { CheckOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation'

interface ShippingAddressSelectionProps {
  shippingAddresses: ShippingAddress[];
  onSelectAddress: (selectedAddress: ShippingAddress) => void;
}

const ShippingAddressSelection: React.FC<ShippingAddressSelectionProps> = ({ shippingAddresses, onSelectAddress }) => {
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const router = useRouter();

  // Tìm địa chỉ mặc định nếu có
  const defaultAddress = shippingAddresses.find(address => address.is_default);
  const addressesToDisplay = defaultAddress
    ? [defaultAddress, ...shippingAddresses.filter(address => address.id !== defaultAddress.id)] // Đặt địa chỉ mặc định lên đầu
    : shippingAddresses;

  // Hiển thị địa chỉ mặc định nếu chưa có địa chỉ nào được chọn
  useEffect(() => {
    if (!selectedAddressId && defaultAddress) {
      setSelectedAddressId(defaultAddress.id); // Chọn mặc định nếu không có địa chỉ nào được chọn
      onSelectAddress(defaultAddress); // Gọi hàm để truyền địa chỉ mặc định lên component cha
    }
  }, [selectedAddressId, defaultAddress, onSelectAddress]);

  const handleAddressSelect = (address: ShippingAddress) => {
    setSelectedAddressId(address.id); // Cập nhật địa chỉ đã chọn
    onSelectAddress(address); // Gọi hàm của parent để cập nhật thông tin giao hàng
  };

  // Hàm xử lý điều hướng đến trang thêm địa chỉ
  const handleAddNewAddress = () => {
    router.push('/tai-khoan?p=address');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <Typography.Title level={5} className="mb-4">Chọn địa chỉ giao hàng</Typography.Title>

      {/* Nút thêm địa chỉ mới */}
      <Button 
        type="primary" 
        className="mb-4" 
        onClick={handleAddNewAddress}
      >
        Thêm địa chỉ mới
      </Button>

      {shippingAddresses.length === 0 ? (
        <Spin tip="Đang tải địa chỉ..." />
      ) : (
        <Space direction="vertical" className="w-full" size="middle">
          {addressesToDisplay.map((address) => (
            <div
              key={address.id}
              className={`w-full p-4 rounded-lg transition-all duration-300 ease-in-out ${
                selectedAddressId === address.id ? 'bg-blue-100' : 'hover:bg-gray-50'
              }`}
              style={{ cursor: 'pointer' }}
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
              <div className="text-sm text-gray-500 mt-1">
                {address.address}
                {address.ward && `, ${address.ward}`}
                {address.district && `, ${address.district}`}
                {address.province && `, ${address.province}`}
              </div>
              {address.note && <div className="text-sm text-gray-500 mt-1">Ghi chú: {address.note}</div>}
            </div>
          ))}
        </Space>
      )}
    </div>
  );
};

export default ShippingAddressSelection;
