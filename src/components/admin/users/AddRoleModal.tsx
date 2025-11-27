'use client'

import { Modal, Form, Select, Button, message, Tag, Avatar, Tooltip, Alert, Spin, Popconfirm } from 'antd'
import { UserOutlined, PlusOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useAllRoles } from '@/hooks/role/useAllRoles'
import { useAddRoleToTenant } from '@/hooks/user-tenant-role/useAddRoleToTenant'
import { useRemoveRoleFromTenant } from '@/hooks/user-tenant-role/useRemoveRoleFromTenant'
import { useUsersOfTenant } from '@/hooks/user-tenant-role/useUserOfTenant'
import { useTenantOne } from '@/hooks/tenant/useTenantOne'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { User } from '@/types/user.type'

interface AddRoleModalProps {
  open: boolean
  onClose: () => void
  user?: User | null
}

interface UserRoleInfo {
  user: {
    id: number
    name: string
    email: string
    avatar?: string
    isActive: boolean
  }
  role: {
    id: number
    name: string
    description?: string
  }
}
export const AddRoleModal: React.FC<AddRoleModalProps> = ({ open, onClose, user }) => {
  const [form] = Form.useForm()
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null)
  
  const queryClient = useQueryClient()
  const tenantId = parseInt(process.env.NEXT_PUBLIC_TENANT_ID || '1', 10)
  
  // Hooks để lấy dữ liệu
  const { data: allRoles, isLoading: isLoadingRoles } = useAllRoles()
  const { data: tenantUsers, isLoading: isLoadingTenantUsers, refetch: refetchTenantUsers } = useUsersOfTenant(tenantId)
  const { data: tenant, isLoading: isLoadingTenant } = useTenantOne(tenantId)
  const addRoleMutation = useAddRoleToTenant()
  const removeRoleMutation = useRemoveRoleFromTenant()

  const usersInTenant = Array.isArray(tenantUsers) ? tenantUsers : tenantUsers?.data || []
  const currentAccountCount = usersInTenant.length
  const maxAccounts = tenant?.maxAccounts || 0
  const canAddMoreAccounts = currentAccountCount < maxAccounts

  const onFinish = async (values: { roleId: number }) => {
    if (!user?.id) return
    
    try {
      await addRoleMutation.mutateAsync({
        userId: user.id,
        tenantId,
        roleId: values.roleId,
      })

      message.success('Gán vai trò cho người dùng thành công')
      form.resetFields()
      refetchTenantUsers()
      queryClient.invalidateQueries({ queryKey: ['users-of-tenant', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onClose()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gán vai trò thất bại')
    }
  }

  const handleRemoveRole = async (userId: number, roleId: number) => {
    try {
      await removeRoleMutation.mutateAsync({
        userId,
        tenantId,
        roleId,
      })

      message.success('Xóa vai trò cho người dùng thành công')
      refetchTenantUsers()
      queryClient.invalidateQueries({ queryKey: ['users-of-tenant', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa vai trò thất bại')
    }
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <PlusOutlined />
          <span>Quản Lý Vai Trò Người Dùng</span>
          <Tag color="blue">Tenant #{tenantId}</Tag>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Loading tenant data */}
        {isLoadingTenant ? (
          <div className="flex justify-center items-center py-8">
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        ) : (
          <>
            {/* Alert với số lượng tài khoản */}
            {tenant && (
              <Alert
                message={
                  <div className="flex items-center justify-between">
                    <span>
                      Số lượng nhân viên: <strong>{currentAccountCount}/{maxAccounts}</strong>
                    </span>
                    {!canAddMoreAccounts && (
                      <span className="text-red-500 text-sm">
                        ⚠️ Đã đạt giới hạn tài khoản
                      </span>
                    )}
                  </div>
                }
                type={canAddMoreAccounts ? 'info' : 'warning'}
                className="mb-4"
              />
            )}

            {/* Hiển thị thông tin user được chọn */}
            {user && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={user.avatar} 
                    icon={!user.avatar && <UserOutlined />} 
                    size="large" 
                  />
                  <div>
                    <div className="font-semibold text-lg">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Form gán vai trò */}
            {canAddMoreAccounts && user && (
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                  name="roleId"
                  label="Chọn vai trò"
                  rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                >
                  <Select 
                    placeholder="Chọn vai trò cho người dùng..." 
                    loading={isLoadingRoles}
                    optionLabelProp="label"
                  >
                    {allRoles?.map((role: any) => (
                      <Select.Option key={role.id} value={role.id} label={role.name}>
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

                <Form.Item className="mb-0 mt-4">
                  <div className="flex justify-end gap-2">
                    <Button onClick={handleClose}>
                      Hủy
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={addRoleMutation.isPending}
                      icon={<PlusOutlined />}
                    >
                      Gán Vai Trò
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            )}

            {/* Thông báo khi đầy */}
            {!canAddMoreAccounts && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <p className="text-yellow-800">
                  🔒 Cửa hàng đã đạt giới hạn tối đa {maxAccounts} tài khoản. 
                  Vui lòng xóa bớt nhân viên để thêm mới.
                </p>
              </div>
            )}

            {/* Danh sách users đã có trong tenant */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <UserOutlined />
                Người dùng trong cửa hàng ({usersInTenant.length})
              </h4>
              
              {isLoadingTenantUsers ? (
                <div className="flex justify-center items-center py-4">
                  <Spin size="small" />
                </div>
              ) : usersInTenant.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {usersInTenant.map((item: UserRoleInfo) => (
                    <div
                      key={item.user.id}
                      className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all relative"
                      onMouseEnter={() => setHoveredUserId(item.user.id)}
                      onMouseLeave={() => setHoveredUserId(null)}
                    >
                      <Avatar 
                        src={item.user.avatar} 
                        icon={!item.user.avatar && <UserOutlined />} 
                        size="large" 
                      />
                      <div className="flex-1">
                        <div className="font-medium">{item.user.name}</div>
                        <div className="text-sm text-gray-600">{item.user.email}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <Tag color="blue">{item.role?.name || 'Chưa có vai trò'}</Tag>
                          <Tag color={item.user.isActive ? 'green' : 'red'}>
                            {item.user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </Tag>
                        </div>
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
                            className="p-2 text-red-500 hover:text-red-600 transition-colors"
                            disabled={removeRoleMutation.isPending}
                          >
                            <DeleteOutlined style={{ fontSize: 16 }} />
                          </button>
                        </Popconfirm>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Chưa có người dùng nào trong cửa hàng
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}