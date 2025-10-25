'use client'

import { Modal, Form, Input, Button, Upload, message, Row, Col, Select, Checkbox, InputNumber } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useUpdateProduct } from '@/hooks/product/useUpdateProduct'
import type { Product } from '@/types/product.type'
import { createImageUploadValidator, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '@/utils/upload.utils'
import { useAllBrands } from '@/hooks/brand/useAllBrands'
import { useAllCategories } from '@/hooks/category/useAllCategories'
import { useAllAttributes } from '@/hooks/attribute/useAllAttributes'
import type { UploadFile } from 'antd/es/upload/interface'
import { Category } from '@/types/category.type'
import { Brand } from '@/types/brand.type'

interface ProductUpdateModalProps {
  open: boolean
  onClose: () => void
  product: Product | null
  refetch?: () => void
}

export const ProductUpdateModal = ({ open, onClose, product, refetch }: ProductUpdateModalProps) => {
  const [form] = Form.useForm()
  const [thumbFile, setThumbFile] = useState<UploadFile[]>([])
  const [imageFiles, setImageFiles] = useState<UploadFile[]>([])
  const { mutateAsync, isPending } = useUpdateProduct()

  const { data: brands } = useAllBrands()
  const { data: categories } = useAllCategories()
  const { data: attributes } = useAllAttributes()

  const getImageUrl = (url: string | null) => {
    if (!url) return undefined
    if (url.startsWith('http')) return url
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'
    return `${baseUrl}${url}`
  }

  useEffect(() => {
    if (product && open) {
      // Set initial form values
      form.setFieldsValue({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        basePrice: product.basePrice,
        status: product.status,
        isPublished: product.isPublished,
        isFeatured: product.isFeatured,
        categoryId: product.categoryId || undefined,
        brandId: product.brandId || undefined,
        seoTitle: product.seoTitle || '',
        seoDescription: product.seoDescription || '',
        seoKeywords: product.seoKeywords || '',
        weight: product.weight || 0,
        length: product.length || 0,
        width: product.width || 0,
        height: product.height || 0,
      })

      if (product.thumb) setThumbFile([{ uid: '-1', name: product.thumb.split('/').pop() || 'thumb.png', status: 'done', url: getImageUrl(product.thumb) }])
      if (product.images?.length) {
        setImageFiles(product.images.map((url, idx) => ({ uid: idx.toString(), name: `img${idx}.png`, status: 'done', url: getImageUrl(url) })))
      }
    } else if (!open) {
      form.resetFields()
      setThumbFile([])
      setImageFiles([])
    }
  }, [product, open, form])

  const onFinish = async (values: any) => {
    if (!product) return
    try {
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('slug', values.slug)
      formData.append('description', values.description || '')
      formData.append('basePrice', values.basePrice?.toString() || '0')
      formData.append('status', values.status)
      formData.append('isPublished', values.isPublished ? 'true' : 'false')
      formData.append('isFeatured', values.isFeatured ? 'true' : 'false')
      formData.append('categoryId', values.categoryId?.toString() || '')
      formData.append('brandId', values.brandId?.toString() || '')
      formData.append('seoTitle', values.seoTitle || '')
      formData.append('seoDescription', values.seoDescription || '')
      formData.append('seoKeywords', values.seoKeywords || '')
      formData.append('weight', values.weight?.toString() || '0')
      formData.append('length', values.length?.toString() || '0')
      formData.append('width', values.width?.toString() || '0')
      formData.append('height', values.height?.toString() || '0')

      // Thumb & Images
      if (thumbFile[0]?.originFileObj) formData.append('thumb', thumbFile[0].originFileObj)
      imageFiles.forEach(file => { if (file.originFileObj) formData.append('images', file.originFileObj) })


      await mutateAsync({ id: product.id, formData })
      message.success('Cập nhật sản phẩm thành công')
      onClose()
      form.resetFields()
      setThumbFile([])
      setImageFiles([])
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật sản phẩm')
    }
  }

  return (
    <Modal title="Cập nhật sản phẩm" open={open} onCancel={onClose} footer={null} destroyOnClose width={800}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Row 1: Thumb & Images */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Ảnh đại diện">
              <Upload
                listType="picture"
                fileList={thumbFile}
                onChange={({ fileList }) => setThumbFile(fileList)}
                beforeUpload={createImageUploadValidator(MAX_IMAGE_SIZE_MB)}
                maxCount={1}
                accept={ACCEPTED_IMAGE_TYPES}
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Ảnh sản phẩm">
              <Upload
                listType="picture"
                fileList={imageFiles}
                onChange={({ fileList }) => setImageFiles(fileList)}
                beforeUpload={createImageUploadValidator(MAX_IMAGE_SIZE_MB)}
                multiple
                accept={ACCEPTED_IMAGE_TYPES}
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        {/* Row 2: Name & Slug */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 3: BasePrice & Status */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Giá cơ bản" name="basePrice" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Trạng thái" name="status">
              <Select>
                <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                <Select.Option value="INACTIVE">INACTIVE</Select.Option>
                <Select.Option value="DRAFT">DRAFT</Select.Option>
                <Select.Option value="OUT_OF_STOCK">OUT_OF_STOCK</Select.Option>
                <Select.Option value="DELETED">DELETED</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Row 4: Category & Brand */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Danh mục" name="categoryId">
              <Select allowClear placeholder="Chọn danh mục">
                {categories?.map((cat: Category) => <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Thương hiệu" name="brandId">
              <Select allowClear placeholder="Chọn thương hiệu">
                {brands?.map((b: Brand) => <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>

        {/* Row 5: Checkboxes */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="isPublished" valuePropName="checked">
              <Checkbox>Đã xuất bản</Checkbox>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="isFeatured" valuePropName="checked">
              <Checkbox>Nổi bật</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* Row 6: Dimensions */}
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Trọng lượng (g)" name="weight">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Dài (cm)" name="length">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Rộng (cm)" name="width">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Cao (cm)" name="height">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="SEO Title" name="seoTitle">
              <Input />
            </Form.Item>

        <Form.Item label="SEO Description" name="seoDescription">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item label="SEO Keywords" name="seoKeywords">
          <Input />
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
