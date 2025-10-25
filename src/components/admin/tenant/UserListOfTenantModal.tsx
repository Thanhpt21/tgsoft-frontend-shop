import { Modal, Avatar, Tag, Spin, Popconfirm, message, Button, Form, Select } from 'antd'
import { UserOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useUsersOfTenant } from '@/hooks/user-tenant-role/useUserOfTenant'
import { useRemoveRoleFromTenant } from '@/hooks/user-tenant-role/useRemoveRoleFromTenant'
import { useAddRoleToTenant } from '@/hooks/user-tenant-role/useAddRoleToTenant'
import { useAllUsers } from '@/hooks/user/useAllUsers'
import { useAllRoles } from '@/hooks/role/useAllRoles'
import { UserRoleInfo } from '@/types/user-tenant-role.type'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { UserRole } from '@/enums/user.enums'

interface UserListModalProps {
  tenantId: number | null
  visible: boolean
  onClose: () => void
}

const UserListModalOfTenant: React.FC<UserListModalProps> = ({ tenantId, visible, onClose }) => {
  const { data: users, isLoading, refetch } = useUsersOfTenant(tenantId !== null ? tenantId : 0)
  const { data: allUsers, isLoading: isLoadingUsers } = useAllUsers()
  const { data: allRoles, isLoading: isLoadingRoles } = useAllRoles()
  const removeRoleMutation = useRemoveRoleFromTenant()
  const addRoleMutation = useAddRoleToTenant()
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null)
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [form] = Form.useForm()

  if (tenantId === null) {
    return <div>Không có tenantId hợp lệ.</div>
  }

  const userList = Array.isArray(users) ? users : users?.data || []

  const handleRemoveRole = async (userId: number, roleId: number) => {
    if (tenantId) {
      try {
        await removeRoleMutation.mutateAsync({
          userId,
          tenantId,
          roleId,
        })
        message.success('Xóa vai trò nhân viên thành công')
        // Refetch để load lại data ngay lập tức
        await refetch()
      } catch (error: any) {
        message.error(error?.response?.data?.message || 'Xóa vai trò nhân viên thất bại')
      }
    }
  }

  const handleAddRole = async (values: { userId: number; roleId: number }) => {
    if (tenantId) {
      try {
        await addRoleMutation.mutateAsync({
          userId: values.userId,
          tenantId,
          roleId: values.roleId,
        })
        message.success('Thêm vai trò cho nhân viên thành công')
        // Refetch để load lại data ngay lập tức
        await refetch()
        setIsAddModalVisible(false)
        form.resetFields()
      } catch (error: any) {
        message.error(error?.response?.data?.message || 'Thêm vai trò thất bại')
      }
    }
  }


  // Filter users đã có trong tenant VÀ loại bỏ admin
  const availableUsers = allUsers?.filter((user: any) => user.role !== 'admin') || []



  return (
    <>
      <Modal
        title="Danh sách nhân viên và vai trò"
        visible={visible}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <div>
            {/* Nút thêm nhân viên */}
            <div className="mb-4">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalVisible(true)}
              >
                Thêm nhân viên
              </Button>
            </div>

            {userList.length > 0 ? (
              <div className="space-y-4">
                {userList.map((item: UserRoleInfo) => (
                  <div
                    key={item.user.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all relative"
                    onMouseEnter={() => setHoveredUserId(item.user.id)}
                    onMouseLeave={() => setHoveredUserId(null)}
                  >
                    <Avatar
                      src={item.user.avatar}
                      icon={!item.user.avatar && <UserOutlined />}
                      size={64}
                    />
                    <div className="flex-1">
                      <div className="text-lg font-semibold">{item.user.name}</div>
                      <div className="text-gray-600">{item.user.email}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <Tag color="blue">{item.role?.name || 'Chưa có vai trò'}</Tag>
                        <Tag color={item.user.isActive ? 'green' : 'red'}>
                          {item.user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </Tag>
                      </div>
                      {item.role?.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {item.role.description}
                        </div>
                      )}
                    </div>

                    {hoveredUserId === item.user.id && (
                      <Popconfirm
                        title={
                          <div>
                            <div>Xác nhận xóa người dùng</div>
                            <div style={{ fontSize: 12, color: '#666' }}>
                              {`Bạn có chắc chắn muốn xóa "${item.user.name}" khỏi cửa hàng?`}
                            </div>
                          </div>
                        }
                        onConfirm={() => handleRemoveRole(item.user.id, item.role.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                      >
                        <button
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-red-500 hover:text-red-600 transition-colors"
                          disabled={removeRoleMutation.isPending}
                        >
                          <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} className="" />
                        </button>
                      </Popconfirm>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Không có nhân viên nào trong cửa hàng này.
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal thêm nhân viên */}
      <Modal
        title="Thêm nhân viên vào cửa hàng"
        visible={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleAddRole}>
          <Form.Item
            name="userId"
            label="Chọn nhân viên"
            rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
          >
            <Select
              placeholder="Chọn nhân viên"
              showSearch
              loading={isLoadingUsers}
              filterOption={(input, option) => {
                const label = option?.label?.toString() || ''
                return label.toLowerCase().includes(input.toLowerCase())
              }}
              options={availableUsers?.map((user: any) => ({
                label: `${user.name} (${user.email})`,
                value: user.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="roleId"
            label="Chọn vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn vai trò" loading={isLoadingRoles}>
              {allRoles?.map((role: any) => (
                <Select.Option key={role.id} value={role.id}>
                  <div>
                    <div className="font-semibold">{role.name}</div>
                    {role.description && (
                      <div className="text-xs text-gray-500">{role.description}</div>
                    )}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setIsAddModalVisible(false)
                  form.resetFields()
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={addRoleMutation.isPending}>
                Thêm
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default UserListModalOfTenant