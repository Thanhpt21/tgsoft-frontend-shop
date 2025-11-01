'use client'

import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Button,
  Row,
  Col,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useUpdateUser } from '@/hooks/user/useUpdateUser'
import { createImageUploadValidator, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '@/utils/upload.utils'

interface UserUpdateModalProps {
  open: boolean
  onClose: () => void
  user: any
  refetch?: () => void
}

export const UserUpdateModal = ({
  open,
  onClose,
  user,
  refetch,
}: UserUpdateModalProps) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<any[]>([])
  const { mutateAsync, isPending } = useUpdateUser()

  useEffect(() => {
    if (user && open) {
      form.setFieldsValue({
        name: user.name,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        role: user.role,
      })

      setFileList(
        user.avatar
          ? [
              {
                uid: '-1',
                name: 'avatar.jpg',
                status: 'done',
                url: user.avatar,
              },
            ]
          : []
      )
    }
  }, [user, open, form])

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData()
      
      // Append các field từ form
      formData.append('name', values.name)
      if (values.phone) formData.append('phone', values.phone)
      if (values.gender) formData.append('gender', values.gender)
      if (values.role) formData.append('role', values.role)
      
      // Append file nếu có (file mới được chọn)
      const file = fileList?.[0]?.originFileObj
      if (file) {
        formData.append('avatar', file)
      }

      await mutateAsync({
        id: user.id,
        data: formData, // ✅ Đúng type rồi
      })

      message.success('Cập nhật user thành công')
      onClose()
      form.resetFields()
      setFileList([]) // ✅ Clear file list
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật user')
    }
  }

  return (
    <Modal
      title="Cập nhật người dùng"
      visible={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Upload ảnh - Nằm trên cùng */}
        <Form.Item label="Ảnh đại diện">
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            maxCount={1}
            accept={ACCEPTED_IMAGE_TYPES}
            beforeUpload={createImageUploadValidator(MAX_IMAGE_SIZE_MB)} 
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>

        {/* Layout 2 cột */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="Tên" 
              name="name" 
              rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Email">
              <Input value={user?.email} disabled placeholder="Email" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="Số điện thoại" 
              name="phoneNumber"
              rules={[
                {
                  pattern: /^0[0-9]{9}$/,
                  message: 'Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số',
                },
              ]}
            >
              <Input 
                placeholder="Nhập số điện thoại" 
                maxLength={10}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Giới tính" name="gender">
              <Select
                allowClear
                placeholder="Chọn giới tính"
                options={[
                  { label: 'Nam', value: 'male' },
                  { label: 'Nữ', value: 'female' },
                  { label: 'Khác', value: 'other' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            block
          >
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
