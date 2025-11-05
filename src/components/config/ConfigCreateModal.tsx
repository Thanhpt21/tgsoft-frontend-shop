'use client'

import { Modal, Form, Input, Button, Upload, message, Row, Col, Checkbox } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useCreateConfig } from '@/hooks/config/useCreateConfig'
import type { UploadFile } from 'antd/es/upload/interface'
import { 
  createImageUploadValidator,
  ACCEPTED_IMAGE_TYPES, 
  MAX_IMAGE_SIZE_MB, 
} from '@/utils/upload.utils'

interface ConfigCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const ConfigCreateModal = ({ open, onClose, refetch }: ConfigCreateModalProps) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [bannerFile, setBannerFile] = useState<UploadFile[]>([])
  const { mutateAsync, isPending } = useCreateConfig()

  // Reset form khi mở/đóng modal
  useEffect(() => {
    if (open) {
      form.resetFields()
      setFileList([])
      setBannerFile([])
      // Set default cho checkbox
      form.setFieldsValue({
        showEmail: true,
        showMobile: true,
        showAddress: true,
        showGooglemap: false,
        showFacebook: true,
        showZalo: false,
        showInstagram: false,
        showTiktok: false,
        showYoutube: false,
        showX: false,
        showLinkedin: false,
      })
    }
  }, [open, form])

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData()
      Object.entries(values).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          formData.append(key, String(val)) // boolean → "true"/"false"
        }
      })

      const file = fileList?.[0]?.originFileObj
      if (file) formData.append('logo', file)
      bannerFile.forEach(file => { if (file.originFileObj) formData.append('banner', file.originFileObj) })

      await mutateAsync(formData)
      message.success('Tạo cấu hình thành công')
      onClose()
      setFileList([])
      setBannerFile([])
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo cấu hình')
    }
  }

  return (
    <Modal 
      title="Tạo cấu hình mới" 
      open={open} 
      onCancel={onClose} 
      footer={null} 
      destroyOnClose
      width={1000}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}>
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
          </Col>
           <Col span={12}>
            <Form.Item label="Ảnh banner" tooltip="Chấp nhận JPEG, PNG, JPG, WEBP. Tối đa 5MB">
              <Upload
                listType="picture"
                fileList={bannerFile}
                onChange={({ fileList }) => setBannerFile(fileList)}
                beforeUpload={createImageUploadValidator(MAX_IMAGE_SIZE_MB)}
                multiple
                accept={ACCEPTED_IMAGE_TYPES}
              >
                <Button icon={<UploadOutlined />}>Chọn banner</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="Tên website" 
              name="name" 
              rules={[{ required: true, message: 'Vui lòng nhập tên website' }]}
            >
              <Input placeholder="Ví dụ: My Shop" />
            </Form.Item>
          </Col>
          
        </Row>


        {/* Email */}
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Form.Item label="Email" name="email">
              <Input placeholder="Email liên hệ" />
            </Form.Item>
          </Col>
          <Col span={12} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Form.Item name="showEmail" valuePropName="checked" noStyle>
              <Checkbox>Hiển thị Email</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* Mobile */}
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Form.Item label="Số điện thoại" name="mobile">
              <Input placeholder="Ví dụ: 0912345678" />
            </Form.Item>
          </Col>
          <Col span={12} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Form.Item name="showMobile" valuePropName="checked" noStyle>
              <Checkbox>Hiển thị SĐT</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* Address */}
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Form.Item label="Địa chỉ" name="address">
              <Input placeholder="Địa chỉ công ty / cửa hàng" />
            </Form.Item>
          </Col>
          <Col span={12} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Form.Item name="showAddress" valuePropName="checked" noStyle>
              <Checkbox>Hiển thị Địa chỉ</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* Google Map */}
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Form.Item label="Google Map" name="googlemap">
              <Input placeholder="Google Map URL hoặc iframe" />
            </Form.Item>
          </Col>
          <Col span={12} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Form.Item name="showGooglemap" valuePropName="checked" noStyle>
              <Checkbox>Hiển thị Google Map</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* Facebook */}
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Form.Item label="Facebook" name="facebook">
              <Input placeholder="Facebook URL" />
            </Form.Item>
          </Col>
          <Col span={12} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Form.Item name="showFacebook" valuePropName="checked" noStyle>
              <Checkbox>Hiển thị Facebook</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* Zalo */}
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Form.Item label="Zalo" name="zalo">
              <Input placeholder="Zalo URL" />
            </Form.Item>
          </Col>
          <Col span={12} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Form.Item name="showZalo" valuePropName="checked" noStyle>
              <Checkbox>Hiển thị Zalo</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* Instagram */}
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Form.Item label="Instagram" name="instagram">
              <Input placeholder="Instagram URL" />
            </Form.Item>
          </Col>
          <Col span={12} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Form.Item name="showInstagram" valuePropName="checked" noStyle>
              <Checkbox>Hiển thị Instagram</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* TikTok */}
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Form.Item label="TikTok" name="tiktok">
              <Input placeholder="TikTok URL" />
            </Form.Item>
          </Col>
          <Col span={12} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Form.Item name="showTiktok" valuePropName="checked" noStyle>
              <Checkbox>Hiển thị TikTok</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* YouTube */}
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Form.Item label="YouTube" name="youtube">
              <Input placeholder="YouTube URL" />
            </Form.Item>
          </Col>
          <Col span={12} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Form.Item name="showYoutube" valuePropName="checked" noStyle>
              <Checkbox>Hiển thị YouTube</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* X */}
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Form.Item label="X (Twitter)" name="x">
              <Input placeholder="X URL" />
            </Form.Item>
          </Col>
          <Col span={12} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Form.Item name="showX" valuePropName="checked" noStyle>
              <Checkbox>Hiển thị X</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* LinkedIn */}
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Form.Item label="LinkedIn" name="linkedin">
              <Input placeholder="LinkedIn URL" />
            </Form.Item>
          </Col>
          <Col span={12} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Form.Item name="showLinkedin" valuePropName="checked" noStyle>
              <Checkbox>Hiển thị LinkedIn</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="VNP_TMN_CODE" name="VNP_TMN_CODE">
              <Input placeholder="Nhập VNP_TMN_CODE" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="VNP_SECRET" name="VNP_SECRET">
              <Input placeholder="Nhập VNP_SECRET" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="VNP_API_URL" name="VNP_API_URL">
              <Input placeholder="Nhập VNP_API_URL" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="EMAIL_USER" name="EMAIL_USER">
              <Input placeholder="Nhập EMAIL_USER" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="EMAIL_PASS" name="EMAIL_PASS">
              <Input.Password placeholder="Nhập EMAIL_PASS" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="EMAIL_FROM" name="EMAIL_FROM">
              <Input placeholder="Nhập EMAIL_FROM" />
            </Form.Item>
          </Col>
        </Row>


        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={isPending} block size="large">
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}