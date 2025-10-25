'use client'

import { Modal, Form, Input, Button, Upload, message, Row, Col } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useUpdateConfig } from '@/hooks/config/useUpdateConfig'
import type { UploadFile } from 'antd/es/upload/interface'
import { 
  createImageUploadValidator,
  ACCEPTED_IMAGE_TYPES, 
  MAX_IMAGE_SIZE_MB, 
} from '@/utils/upload.utils'
import { getImageUrl } from '@/utils/getImageUrl'

interface ConfigUpdateModalProps {
  open: boolean
  onClose: () => void
  config: any
  refetch?: () => void
}

export const ConfigUpdateModal = ({ open, onClose, config, refetch }: ConfigUpdateModalProps) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const { mutateAsync, isPending } = useUpdateConfig()

  useEffect(() => {
    if (config && open) {
      form.setFieldsValue({
        name: config.name,
        email: config.email || '',
        mobile: config.mobile || '',
        address: config.address || '',
        googlemap: config.googlemap || '',
        facebook: config.facebook || '',
        zalo: config.zalo || '',
        instagram: config.instagram || '',
        tiktok: config.tiktok || '',
        youtube: config.youtube || '',
        x: config.x || '',
        linkedin: config.linkedin || '',
      })

      if (config.logo) {
        setFileList([
          {
            uid: '-1',
            name: config.logo.split('/').pop() || 'logo.png',
            status: 'done',
            url: getImageUrl(config.logo) || undefined,
          },
        ])
      }
    }
  }, [config, open, form])

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData()
      Object.entries(values).forEach(([key, val]) => {
        if (val !== undefined && val !== null) formData.append(key, val as string)
      })

      const file = fileList?.[0]?.originFileObj
      if (file) formData.append('logo', file)

      await mutateAsync({ id: config.id, data: formData })
      message.success('Cập nhật cấu hình thành công')
      onClose()
      form.resetFields()
      setFileList([])
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật cấu hình')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setFileList([])
    }
  }, [open, form])

  return (
    <Modal 
      title="Cập nhật cấu hình" 
      open={open} 
      onCancel={onClose} 
      footer={null} 
      destroyOnClose
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Tên website" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên website' }]}>
              <Input placeholder="Ví dụ: My Shop" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Email" name="email">
              <Input placeholder="Email liên hệ" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Số điện thoại" name="mobile">
              <Input placeholder="Ví dụ: 0123456789" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Địa chỉ" name="address">
              <Input placeholder="Địa chỉ công ty / cửa hàng" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Google Map" name="googlemap">
              <Input placeholder="Google Map URL" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Facebook" name="facebook">
              <Input placeholder="Facebook URL" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Zalo" name="zalo">
              <Input placeholder="Zalo URL" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Instagram" name="instagram">
              <Input placeholder="Instagram URL" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="TikTok" name="tiktok">
              <Input placeholder="TikTok URL" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="YouTube" name="youtube">
              <Input placeholder="YouTube URL" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="X" name="x">
              <Input placeholder="X URL" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="LinkedIn" name="linkedin">
              <Input placeholder="LinkedIn URL" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Logo" tooltip="Chấp nhận JPEG, PNG, JPG, WEBP. Tối đa 5MB">
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={createImageUploadValidator(MAX_IMAGE_SIZE_MB)}
            maxCount={1}
            accept={ACCEPTED_IMAGE_TYPES}
          >
            <Button icon={<UploadOutlined />}>Chọn logo</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
