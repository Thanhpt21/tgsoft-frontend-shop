"use client";

import React, { useState, useEffect } from "react";
import { Button, Modal, message, Input, Row, Col, Select } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useShippingAddressesByUserId } from "@/hooks/shipping-address/useShippingAddressesByUserId";
import { ShippingAddress } from "@/types/shipping-address.type";
import { useCreateShippingAddress } from "@/hooks/shipping-address/useCreateShippingAddress";
import { useDeleteShippingAddress } from "@/hooks/shipping-address/useDeleteShippingAddress";
import { useSetDefaultShippingAddress } from "@/hooks/shipping-address/useSetDefaultShippingAddress";
import { useUpdateShippingAddress } from "@/hooks/shipping-address/useUpdateShippingAddress";
import { useQueryClient } from "@tanstack/react-query";

const { Option } = Select;

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
  const {
    data: shippingAddresses = [],
    isLoading,
    isError,
  } = useShippingAddressesByUserId(userIdNumber);
  const { mutate: createShippingAddress } = useCreateShippingAddress();
  const { mutate: deleteShippingAddress } = useDeleteShippingAddress();
  const { mutate: setDefaultShippingAddress } = useSetDefaultShippingAddress();
  const { mutate: updateShippingAddress } = useUpdateShippingAddress();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(
    null
  );

  const getDefaultFormValues = (): ShippingAddress => ({
    id: 0,
    tenantId: 0,
    userId: userIdNumber,
    name: "",
    phone: "",
    address: "",
    note: "",
    province_id: 0,
    province: "",
    district_id: 0,
    district: "",
    ward_id: 0,
    ward: "",
    province_name: "",
    district_name: "",
    ward_name: "",
    is_default: false,
    createdAt: "",
    updatedAt: "",
  });

  const [formValues, setFormValues] = useState<ShippingAddress>(
    getDefaultFormValues()
  );
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch('https://esgoo.net/api-tinhthanh/1/0.htm');
        const data = await res.json();
        if (data.error === 0 && data.data) {
          const formatted = data.data.map((p: any) => ({
            code: p.id,
            name: p.full_name,
          }));
          setProvinces(formatted);
        }
      } catch (error) {
        console.error('❌ Lỗi load tỉnh:', error);
        message.error('Không thể tải danh sách tỉnh/thành phố');
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    const loadAddressData = async () => {
      if (editingAddress) {
        const provId = String(editingAddress.province_id);
        const distId = String(editingAddress.district_id);
        const wardId = String(editingAddress.ward_id);

        setFormValues({ ...editingAddress, userId: userIdNumber });
        setSelectedProvince(provId);
        setSelectedDistrict(distId);
        setSelectedWard(wardId);

        if (provId && provId !== "0") {
          try {
            const distRes = await fetch(`https://esgoo.net/api-tinhthanh/2/${provId}.htm`);
            const distData = await distRes.json();
            if (distData.error === 0 && distData.data) {
              const formattedDist = distData.data.map((d: any) => ({
                code: d.id,
                name: d.full_name,
              }));
              setDistricts(formattedDist);
            }

            if (distId && distId !== '0') {
              const wardRes = await fetch(`https://esgoo.net/api-tinhthanh/3/${distId}.htm`);
              const wardData = await wardRes.json();
              if (wardData.error === 0 && wardData.data) {
                const formattedWard = wardData.data.map((w: any) => ({
                  code: w.id,
                  name: w.full_name,
                }));
                setWards(formattedWard);
              }
            } else {
              setWards([]);
            }
          } catch (err) {
            console.error('❌ Lỗi load địa chỉ chi tiết:', err);
            message.error('Không tải được địa chỉ chi tiết');
          }
        } else {
          setDistricts([]);
          setWards([]);
        }
      } else {
        setFormValues(getDefaultFormValues());
        setSelectedProvince("");
        setSelectedDistrict("");
        setSelectedWard("");
        setDistricts([]);
        setWards([]);
      }
    };

    loadAddressData();
  }, [isModalOpen, editingAddress, userIdNumber]);

  const handleProvinceChange = async (value: string) => {
    const province = provinces.find((p) => p.code === value);
    if (!province) return;

    setSelectedProvince(value);
    updateField({
      province_id: Number(value),
      province: province.name,
      province_name: province.name,
      district_id: 0,
      district: "",
      district_name: "",
      ward_id: 0,
      ward: "",
      ward_name: "",
    });

    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);

    try {
      const res = await fetch(`https://esgoo.net/api-tinhthanh/2/${value}.htm`);
      const data = await res.json();
      if (data.error === 0 && data.data) {
        const formatted = data.data.map((d: any) => ({
          code: d.id,
          name: d.full_name,
        }));
        setDistricts(formatted);
      }
    } catch (err) {
      console.error('❌ Lỗi load quận/huyện:', err);
      message.error('Không tải được quận/huyện');
    }
  };

  const handleDistrictChange = async (value: string) => {
    const district = districts.find((d) => d.code === value);
    if (!district) return;

    setSelectedDistrict(value);
    updateField({
      district_id: Number(value),
      district: district.name,
      district_name: district.name,
      ward_id: 0,
      ward: "",
      ward_name: "",
    });

    setSelectedWard("");
    setWards([]);

    try {
      const res = await fetch(`https://esgoo.net/api-tinhthanh/3/${value}.htm`);
      const data = await res.json();
      if (data.error === 0 && data.data) {
        const formatted = data.data.map((w: any) => ({
          code: w.id,
          name: w.full_name,
        }));
        setWards(formatted);
      }
    } catch (err) {
      console.error('❌ Lỗi load phường/xã:', err);
      message.error('Không tải được phường/xã');
    }
  };

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

  const updateField = (updates: Partial<ShippingAddress>) => {
    const newValues = { ...formValues, ...updates };
    setFormValues(newValues);
  };

  const handleInputChange = (field: keyof ShippingAddress, value: any) => {
    updateField({ [field]: value });
  };

  const openAddModal = () => {
    setEditingAddress(null);
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
        await updateShippingAddress({
          id: editingAddress.id,
          data: formValues,
        });
        message.success("Cập nhật địa chỉ thành công!");
      } else {
        await createShippingAddress({ ...formValues, userId: userIdNumber });
        message.success("Thêm địa chỉ thành công!");
      }

      queryClient.invalidateQueries({
        queryKey: ["shipping-addresses", "user", userIdNumber],
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('❌ Lỗi submit:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa địa chỉ này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteShippingAddress(id);
          queryClient.invalidateQueries({
            queryKey: ["shipping-addresses", "user", userIdNumber],
          });
          message.success("Đã xóa thành công!");
        } catch (error) {
          message.error("Xóa thất bại.");
        }
      },
    });
  };

  const handleSetDefault = (addressId: number) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Đặt làm địa chỉ mặc định?",
      okText: "Đặt mặc định",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await setDefaultShippingAddress({ userId: userIdNumber, addressId });
          queryClient.invalidateQueries({
            queryKey: ["shipping-addresses", "user", userIdNumber],
          });
          message.success("Đã đặt mặc định!");
        } catch (error) {
          message.error("Lỗi khi đặt mặc định.");
        }
      },
    });
  };

  const isAddButtonDisabled = shippingAddresses.length >= 5;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải địa chỉ...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center bg-red-50 rounded-xl p-8">
          <p className="text-red-600 font-semibold">Lỗi tải dữ liệu địa chỉ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Địa chỉ giao hàng
          </h2>
          <p className="text-gray-600">
            Quản lý địa chỉ giao hàng của bạn ({shippingAddresses.length}/5)
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() =>
            isAddButtonDisabled
              ? message.warning("Tối đa 5 địa chỉ.")
              : openAddModal()
          }
          disabled={isAddButtonDisabled}
          className="w-full md:w-auto h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Thêm địa chỉ mới
        </Button>
      </div>

      {/* Address List */}
      <div className="space-y-4">
        {shippingAddresses.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <EnvironmentOutlined className="text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">
              Chưa có địa chỉ nào
            </p>
            <p className="text-gray-400 mb-6">
              Thêm địa chỉ giao hàng để mua sắm dễ dàng hơn
            </p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAddModal}
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-lg font-semibold"
            >
              Thêm địa chỉ đầu tiên
            </Button>
          </div>
        ) : (
          shippingAddresses.map((address: ShippingAddress) => (
            <div
              key={address.id}
              className={`
                bg-white rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg
                ${
                  address.is_default
                    ? "border-blue-500 bg-blue-50/30"
                    : "border-gray-200 hover:border-blue-300"
                }
              `}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <UserOutlined className="text-gray-500" />
                      <span className="text-lg font-bold text-gray-900">
                        {address.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneOutlined className="text-gray-500" />
                      <span className="text-gray-600">{address.phone}</span>
                    </div>
                    {address.is_default && (
                      <span className="w-fit px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-full shadow-md">
                        Mặc định
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-gray-600 mb-2">
                    <EnvironmentOutlined className="text-gray-400 mt-1 flex-shrink-0" />
                    <p className="leading-relaxed">
                      {address.address}, {address.ward_name || address.ward},{" "}
                      {address.district_name || address.district},{" "}
                      {address.province_name || address.province}
                    </p>
                  </div>

                  {/* Note */}
                  {address.note && (
                    <p className="text-sm text-gray-500 italic mt-2 pl-6">
                      Ghi chú: {address.note}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                  <Button
                    icon={<CheckCircleOutlined />}
                    type={address.is_default ? "primary" : "default"}
                    onClick={() => handleSetDefault(address.id)}
                    disabled={address.is_default}
                    className={`
                      flex-1 lg:flex-none lg:w-auto h-10 rounded-lg font-medium transition-all duration-300
                      ${
                        address.is_default
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-0"
                          : "hover:border-blue-500 hover:text-blue-600"
                      }
                    `}
                  >
                    {address.is_default ? "Đang dùng" : "Đặt mặc định"}
                  </Button>
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleDelete(address.id)}
                    className="flex-1 lg:flex-none lg:w-auto h-10 rounded-lg font-medium hover:shadow-md transition-all duration-300"
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="text-xl font-bold text-gray-900">
            {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
      >
        <div className="space-y-4 py-4">
          {/* Personal Info */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <UserOutlined /> Thông tin người nhận
            </h3>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Nguyễn Văn A"
                  value={formValues.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="h-11 rounded-lg"
                />
              </Col>
              <Col xs={24} md={12}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="0901234567"
                  value={formValues.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="h-11 rounded-lg"
                />
              </Col>
            </Row>
          </div>

          {/* Location */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <EnvironmentOutlined /> Địa chỉ giao hàng
            </h3>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <Select
                  key={`province-${selectedProvince}`}
                  showSearch
                  placeholder="Chọn tỉnh/thành"
                  value={selectedProvince || undefined}
                  onChange={handleProvinceChange}
                  filterOption={(input, option) =>
                    String(option?.children || "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="w-full h-11"
                >
                  {provinces.map((p) => (
                    <Option key={p.code} value={p.code}>
                      {p.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} md={8}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quận/Huyện <span className="text-red-500">*</span>
                </label>
                <Select
                  key={`district-${selectedDistrict}`}
                  showSearch
                  placeholder="Chọn quận/huyện"
                  value={selectedDistrict || undefined}
                  onChange={handleDistrictChange}
                  disabled={!selectedProvince}
                  filterOption={(input, option) =>
                    String(option?.children || "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="w-full h-11"
                >
                  {districts.map((d) => (
                    <Option key={d.code} value={d.code}>
                      {d.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} md={8}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phường/Xã <span className="text-red-500">*</span>
                </label>
                <Select
                  key={`ward-${selectedWard}`}
                  showSearch
                  placeholder="Chọn phường/xã"
                  value={selectedWard || undefined}
                  onChange={handleWardChange}
                  disabled={!selectedDistrict}
                  filterOption={(input, option) =>
                    String(option?.children || "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="w-full h-11"
                >
                  {wards.map((w) => (
                    <Option key={w.code} value={w.code}>
                      {w.name}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col span={24}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Địa chỉ chi tiết <span className="text-red-500">*</span>
                </label>
                <Input.TextArea
                  placeholder="Số nhà, tên đường, khu vực..."
                  rows={3}
                  value={formValues.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="rounded-lg"
                />
              </Col>
            </Row>
          </div>

          {/* Note */}
          <div className="mb-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <Input.TextArea
              placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
              rows={2}
              value={formValues.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              className="rounded-lg mb-0"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end -mt-2">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="h-11 px-8 rounded-lg font-semibold"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              className="h-11 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-lg font-semibold"
            >
              Lưu địa chỉ
            </Button>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .ant-select-selector {
          border-radius: 0.5rem !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
        }

        .ant-input,
        .ant-input-textarea {
          border-radius: 0.5rem !important;
        }

        .ant-input:hover,
        .ant-input:focus,
        .ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default AddressShipping;