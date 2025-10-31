'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  List,
  Modal,
  message,
  Input,
  Row,
  Col,
  Typography,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useShippingAddressesByUserId } from '@/hooks/shipping-address/useShippingAddressesByUserId';
import { ShippingAddress } from '@/types/shipping-address.type';
import { useCreateShippingAddress } from '@/hooks/shipping-address/useCreateShippingAddress';
import { useDeleteShippingAddress } from '@/hooks/shipping-address/useDeleteShippingAddress';
import { useSetDefaultShippingAddress } from '@/hooks/shipping-address/useSetDefaultShippingAddress';
import { useUpdateShippingAddress } from '@/hooks/shipping-address/useUpdateShippingAddress';
import { useQueryClient } from '@tanstack/react-query';

const { Title } = Typography;
const { Option } = Select;

// === Types cho API tỉnh/thành ===
interface Province {
  code: string;
  name: string;
}
interface District {
  code: string;
  name: string;
}
interface Ward {
  code: string;
  name: string;
}

const AddressShipping: React.FC<{ userId: number | string }> = ({ userId }) => {
  const userIdNumber = Number(userId);
  const { data: shippingAddresses = [], isLoading, isError } =
    useShippingAddressesByUserId(userIdNumber);
  const { mutate: createShippingAddress } = useCreateShippingAddress();
  const { mutate: deleteShippingAddress } = useDeleteShippingAddress();
  const { mutate: setDefaultShippingAddress } = useSetDefaultShippingAddress();
  const { mutate: updateShippingAddress } = useUpdateShippingAddress();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);

  // === Form State ===
  const getDefaultFormValues = (): ShippingAddress => ({
    id: 0,
    tenantId: 0,
    userId: userIdNumber,
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

  const [formValues, setFormValues] = useState<ShippingAddress>(getDefaultFormValues());

  // === Tỉnh/Thành/Huyện/Xã ===
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');

  // === Load Tỉnh (chỉ 1 lần) ===
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch('https://provinces.open-api.vn/api/p/');
        const data: Province[] = await res.json();
        setProvinces(data);
      } catch (error) {
        message.error('Không thể tải danh sách tỉnh/thành phố');
      }
    };
    fetchProvinces();
  }, []);

  // === Khi mở modal: đồng bộ dữ liệu + load quận/huyện/phường ===
  useEffect(() => {
    if (!isModalOpen) return;

    const loadAddressData = async () => {
      if (editingAddress) {
        const provId = String(editingAddress.province_id);
        const distId = String(editingAddress.district_id);
        const wardId = String(editingAddress.ward_id);

        // Cập nhật form + select
        setFormValues({ ...editingAddress, userId: userIdNumber });
        setSelectedProvince(provId);
        setSelectedDistrict(distId);
        setSelectedWard(wardId);

        // Load quận/huyện + phường/xã
        if (provId && provId !== '0') {
          try {
            const provRes = await fetch(`https://provinces.open-api.vn/api/p/${provId}?depth=2`);
            const provData = await provRes.json();
            setDistricts(provData.districts || []);

            if (distId && distId !== '0') {
              const wardRes = await fetch(`https://provinces.open-api.vn/api/d/${distId}?depth=2`);
              const wardData = await wardRes.json();
              setWards(wardData.wards || []);
            } else {
              setWards([]);
            }
          } catch (err) {
            message.error('Không tải được địa chỉ chi tiết');
          }
        } else {
          setDistricts([]);
          setWards([]);
        }
      } else {
        // Thêm mới
        setFormValues(getDefaultFormValues());
        setSelectedProvince('');
        setSelectedDistrict('');
        setSelectedWard('');
        setDistricts([]);
        setWards([]);
      }
    };

    loadAddressData();
  }, [isModalOpen, editingAddress, userIdNumber]);

  // === Xử lý thay đổi tỉnh ===
  const handleProvinceChange = async (value: string) => {
    const province = provinces.find((p) => p.code === value);
    if (!province) return;

    setSelectedProvince(value);
    updateField({
      province_id: Number(value),
      province: province.name,
      province_name: province.name,
      district_id: 0,
      district: '',
      district_name: '',
      ward_id: 0,
      ward: '',
      ward_name: '',
    });

    setSelectedDistrict('');
    setSelectedWard('');
    setDistricts([]);
    setWards([]);

    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${value}?depth=2`);
      const data = await res.json();
      setDistricts(data.districts || []);
    } catch (err) {
      message.error('Không tải được quận/huyện');
    }
  };

  // === Xử lý thay đổi quận/huyện ===
  const handleDistrictChange = async (value: string) => {
    const district = districts.find((d) => d.code === value);
    if (!district) return;

    setSelectedDistrict(value);
    updateField({
      district_id: Number(value),
      district: district.name,
      district_name: district.name,
      ward_id: 0,
      ward: '',
      ward_name: '',
    });

    setSelectedWard('');
    setWards([]);

    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${value}?depth=2`);
      const data = await res.json();
      setWards(data.wards || []);
    } catch (err) {
      message.error('Không tải được phường/xã');
    }
  };

  // === Xử lý thay đổi phường/xã ===
  const handleWardChange = (value: string) => {
    const ward = wards.find((w) => w.code === value);
    if (!ward) return;

    setSelectedWard(value);
    updateField({
      ward_id: Number(value),
      ward: ward.name,
      ward_name: ward.name,
    });
  };

  // === Cập nhật field form ===
  const updateField = (updates: Partial<ShippingAddress>) => {
    const newValues = { ...formValues, ...updates };
    setFormValues(newValues);
  };

  const handleInputChange = (field: keyof ShippingAddress, value: any) => {
    updateField({ [field]: value });
  };

  // === Modal Actions ===
  const openAddModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const openEditModal = (address: ShippingAddress) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const { name, phone, address, province_id, district_id, ward_id } = formValues;

    if (!name || !phone || !address || !province_id || !district_id || !ward_id) {
      message.warning('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    try {
      if (editingAddress) {
        await updateShippingAddress({ id: editingAddress.id, data: formValues });
        message.success('Cập nhật địa chỉ thành công!');
      } else {
        await createShippingAddress({ ...formValues, userId: userIdNumber });
        message.success('Thêm địa chỉ thành công!');
      }

      queryClient.invalidateQueries({
        queryKey: ['shipping-addresses', 'user', userIdNumber],
      });
      setIsModalOpen(false);
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
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
          queryClient.invalidateQueries({ queryKey: ['shipping-addresses', 'user', userIdNumber] });
          message.success('Đã xóa thành công!');
        } catch (error) {
          message.error('Xóa thất bại.');
        }
      },
    });
  };

  const handleSetDefault = (addressId: number) => {
    Modal.confirm({
      title: 'Xác nhận',
      content: 'Đặt làm địa chỉ mặc định?',
      okText: 'Đặt mặc định',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await setDefaultShippingAddress({ userId: userIdNumber, addressId });
          queryClient.invalidateQueries({ queryKey: ['shipping-addresses', 'user', userIdNumber] });
          message.success('Đã đặt mặc định!');
        } catch (error) {
          message.error('Lỗi khi đặt mặc định.');
        }
      },
    });
  };

  const isAddButtonDisabled = shippingAddresses.length >= 5;

  if (isLoading) return <div className="p-6">Đang tải...</div>;
  if (isError) return <div className="p-6 text-red-500">Lỗi tải dữ liệu.</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Danh sách địa chỉ giao hàng</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() =>
            isAddButtonDisabled ? message.warning('Tối đa 5 địa chỉ.') : openAddModal()
          }
        >
          Thêm địa chỉ
        </Button>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={shippingAddresses}
        renderItem={(address: ShippingAddress) => (
          <List.Item
            actions={[
              // <Button icon={<EditOutlined />} onClick={() => openEditModal(address)} />,
              <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(address.id)} />,
              <Button
                icon={<CheckCircleOutlined />}
                type={address.is_default ? 'primary' : 'default'}
                onClick={() => handleSetDefault(address.id)}
                disabled={address.is_default}
              >
                {address.is_default ? 'Mặc định' : 'Đặt mặc định'}
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <span>
                  <strong>{address.name}</strong>
                  <span style={{ marginLeft: 8, fontStyle: 'italic', color: '#666' }}>
                    {address.phone}
                  </span>
                </span>
              }
              description={
                `${address.address}, ${address.ward_name || address.ward}, ` +
                `${address.district_name || address.district}, ${address.province_name || address.province}`
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title={editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        width={900}
        okText="Lưu"
        cancelText="Hủy"
      >
        <div className="space-y-4">
          <Title level={4}>Thông tin giao hàng</Title>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <label className="block text-sm font-medium mb-1">Họ và tên *</label>
              <Input
                placeholder="Nguyễn Văn A"
                value={formValues.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </Col>
            <Col xs={24} md={12}>
              <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
              <Input
                placeholder="0901234567"
                value={formValues.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <label className="block text-sm font-medium mb-1">Địa chỉ chi tiết *</label>
              <Input.TextArea
                placeholder="Số 123, đường ABC..."
                rows={2}
                value={formValues.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <label className="block text-sm font-medium mb-1">Tỉnh/Thành phố *</label>
              <Select
                key={`province-${selectedProvince}`}
                showSearch
                placeholder="Chọn tỉnh"
                value={selectedProvince || undefined}
                onChange={handleProvinceChange}
                filterOption={(input, option) =>
                  String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: '100%' }}
              >
                {provinces.map((p) => (
                  <Option key={p.code} value={p.code}>
                    {p.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <label className="block text-sm font-medium mb-1">Quận/Huyện *</label>
              <Select
                key={`district-${selectedDistrict}`}
                showSearch
                placeholder="Chọn quận"
                value={selectedDistrict || undefined}
                onChange={handleDistrictChange}
                disabled={!selectedProvince}
                filterOption={(input, option) =>
                  String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: '100%' }}
              >
                {districts.map((d) => (
                  <Option key={d.code} value={d.code}>
                    {d.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <label className="block text-sm font-medium mb-1">Phường/Xã *</label>
              <Select
                key={`ward-${selectedWard}`}
                showSearch
                placeholder="Chọn phường"
                value={selectedWard || undefined}
                onChange={handleWardChange}
                disabled={!selectedDistrict}
                filterOption={(input, option) =>
                  String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: '100%' }}
              >
                {wards.map((w) => (
                  <Option key={w.code} value={w.code}>
                    {w.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <label className="block text-sm font-medium mb-1">Ghi chú (tùy chọn)</label>
              <Input.TextArea
                placeholder="Giao giờ hành chính..."
                rows={2}
                value={formValues.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
              />
            </Col>
          </Row>
        </div>
      </Modal>
    </div>
  );
};

export default AddressShipping;