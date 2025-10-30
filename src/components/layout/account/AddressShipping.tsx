'use client';

import React, { useState, useEffect } from 'react';
import { Button, List, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useShippingAddressesByUserId } from '@/hooks/shipping-address/useShippingAddressesByUserId';
import { ShippingAddress } from '@/types/shipping-address.type';
import { useCreateShippingAddress } from '@/hooks/shipping-address/useCreateShippingAddress';
import { useDeleteShippingAddress } from '@/hooks/shipping-address/useDeleteShippingAddress'; 
import { useSetDefaultShippingAddress } from '@/hooks/shipping-address/useSetDefaultShippingAddress'; 
import { useUpdateShippingAddress } from '@/hooks/shipping-address/useUpdateShippingAddress';
import ShippingInformation from '../checkout/ShippingInformation';
import { useQueryClient } from '@tanstack/react-query';


const AddressShipping: React.FC<{ userId: number | string }> = ({ userId }) => {
  const { data: shippingAddresses, isLoading, isError } = useShippingAddressesByUserId(userId);
  const { mutate: createShippingAddress } = useCreateShippingAddress();
  const { mutate: deleteShippingAddress } = useDeleteShippingAddress();
  const { mutate: setDefaultShippingAddress } = useSetDefaultShippingAddress();
  const { mutate: updateShippingAddress } = useUpdateShippingAddress();
  const queryClient = useQueryClient();


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [formValues, setFormValues] = useState<ShippingAddress>({
    id: 0,
    tenantId: 0,
    userId: null,
    name: '',
    phone: '',
    address: '',
    note: '',
    province_id: 0,
    province: '',
    district_id: 0,
    district: '',
    ward_id: 0,
    ward: '',
    province_name: '',
    district_name: '',
    ward_name: '',
    is_default: false,
    createdAt: '',
    updatedAt: '',
  });

  const handleShippingInfoUpdate = (updatedShippingInfo: ShippingAddress) => {
    setFormValues(updatedShippingInfo);
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setFormValues({
      id: 0,
      tenantId: 0,
      userId: null,
      name: '',
      phone: '',
      address: '',
      note: '',
      province_id: 0,
      province: '',
      district_id: 0,
      district: '',
      ward_id: 0,
      ward: '',
      province_name: '',
      district_name: '',
      ward_name: '',
      is_default: false,
      createdAt: '',
      updatedAt: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (address: ShippingAddress) => {
    setEditingAddress(address);
    setFormValues(address);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const { name, phone, address, province_id, district_id, ward_id } = formValues;

    if (!name || !phone || !address || !province_id || !district_id || !ward_id) {
      message.warning('Vui lòng điền đầy đủ thông tin giao hàng (Họ tên, SĐT, địa chỉ, Tỉnh/Quận/Xã).');
      return;
    }

    if (editingAddress) {
      try {
        await updateShippingAddress({ id: editingAddress.id, data: formValues });
     
          queryClient.invalidateQueries({
            queryKey: ['shipping-addresses', 'user'],
          });
             message.success('Địa chỉ đã được cập nhật thành công!');
      } catch (error) {
        message.error('Có lỗi xảy ra khi cập nhật địa chỉ.');
      }
    } else {
      try {
        await createShippingAddress(formValues);
        queryClient.invalidateQueries({
            queryKey: ['shipping-addresses', 'user'],
          });
        message.success('Địa chỉ giao hàng đã được thêm thành công!');
      } catch (error) {
        message.error('Có lỗi xảy ra khi thêm địa chỉ.');
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa địa chỉ này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteShippingAddress(id);
            queryClient.invalidateQueries({
            queryKey: ['shipping-addresses', 'user'],
          });
          message.success('Đã xóa địa chỉ thành công!');
          
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa địa chỉ.');
        }
      },
    });
  };

  const handleSetDefault = (addressId: number) => {
    Modal.confirm({
      title: 'Xác nhận',
      content: 'Bạn có muốn đặt địa chỉ này làm mặc định không?',
      okText: 'Đặt mặc định',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const userIdNumber = Number(userId);
          if (isNaN(userIdNumber)) {
            message.error('ID người dùng không hợp lệ!');
            return;
          }

          // Gọi API để thay đổi địa chỉ mặc định
          await setDefaultShippingAddress({ userId: userIdNumber, addressId })
          
          // Invalidate query để làm mới danh sách địa chỉ
          queryClient.invalidateQueries({
            queryKey: ['shipping-addresses', 'user', userIdNumber],
          });
        } catch (error) {
          message.error('Có lỗi xảy ra khi đặt địa chỉ làm mặc định.');
        }
      },
    });
  };


  const isAddButtonDisabled = shippingAddresses?.length >= 5;

  const handleAddButtonClick = () => {
    if (isAddButtonDisabled) {
      // Hiển thị thông báo mà không mở form
      message.warning(`Bạn chỉ tạo được tối đa 5 địa chỉ.`);
    } else {
      // Mở form nếu số lượng địa chỉ chưa đạt giới hạn
      openAddModal();
    }
  };

  if (isLoading) return <div className="p-6">Đang tải địa chỉ...</div>;
  if (isError) return <div className="p-6 text-red-500">Lỗi khi tải địa chỉ.</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Danh sách địa chỉ giao hàng</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddButtonClick} >
          Thêm địa chỉ
        </Button>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={shippingAddresses}
        renderItem={(address: ShippingAddress) => (
          <List.Item
            actions={[
              <Button icon={<EditOutlined />} onClick={() => openEditModal(address)} />,
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDelete(address.id)}
              />,
              <Button
                icon={<CheckCircleOutlined />}
                type={address.is_default ? 'primary' : 'default'}
                onClick={() => handleSetDefault(address.id)}
                 disabled={address.is_default} 
              >
                {address.is_default ? 'Mặc định' : 'Đặt làm mặc định'}
                
              </Button>,
            ]}
          >
           <List.Item.Meta
              title={
                <span>
                  <span style={{ fontWeight: 'bold' }}>{address.name}</span>
                  <span style={{ marginLeft: '10px', fontStyle: 'italic' }}>{address.phone}</span>
                </span>
              }
              description={`${address.address}, ${
                address.ward_name || address.ward // fallback if ward_name is null
              }, ${
                address.district_name || address.district // fallback if district_name is null
              }, ${
                address.province_name || address.province // fallback if province_name is null
              }`}
            />

          </List.Item>
        )}
      />
      <Modal
        title={editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ'}
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        width={800}
      >
        {/* Using the ShippingInformation component */}
        <ShippingInformation
          shippingInfo={formValues}
          setShippingInfo={setFormValues}
          onShippingInfoUpdate={handleShippingInfoUpdate}
        />
      </Modal>
    </div>
  );
};

export default AddressShipping;
