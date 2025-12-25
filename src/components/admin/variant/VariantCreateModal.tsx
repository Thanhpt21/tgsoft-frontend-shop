'use client'

import { Modal, Form, Input, Button, Upload, message, Row, Col, InputNumber, Spin, Radio } from 'antd'
import { UploadOutlined, ReloadOutlined } from '@ant-design/icons'
import { useState, useEffect, useCallback } from 'react'
import type { UploadFile } from 'antd/es/upload/interface'
import { api } from '@/lib/axios'
import { useCreateProductVariant } from '@/hooks/product-variant/useCreateProductVariant'
import { createImageUploadValidator, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '@/utils/upload.utils'
import { useProductAttributes } from '@/hooks/product-attribute/useProductAttributes'
import { AttributeValue } from '@/types/attribute-value.type'

interface VariantCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
  productId: number | string
}

export const VariantCreateModal = ({ open, onClose, refetch, productId }: VariantCreateModalProps) => {
  const [form] = Form.useForm()
  const [thumbFile, setThumbFile] = useState<UploadFile[]>([])
  // NOTE: changed value type to number (attributeValueId)
  const [selectedAttrValues, setSelectedAttrValues] = useState<Record<number, number>>({})
  const [attributeValuesMap, setAttributeValuesMap] = useState<Record<number, AttributeValue[]>>({})
  const [attributesInfo, setAttributesInfo] = useState<Record<number, { id: number; name: string }>>({})
  const { mutateAsync, isPending } = useCreateProductVariant()

  // Lấy attribute của product
  const { data: productAttributesData, isLoading: loadingAttrs } = useProductAttributes(Number(productId))
  const productAttributes = Array.isArray(productAttributesData) ? productAttributesData : []

  // Hàm tạo barcode ngẫu nhiên
  const generateBarcode = useCallback(() => {
    // Định dạng: BR{timestamp}-{random string}
    const timestamp = Date.now().toString().slice(-8) // 8 số cuối timestamp
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase() // 6 ký tự random
    return `BR${timestamp}${randomStr}`
  }, [])

  // Hàm generate SKU ngẫu nhiên 5-10 ký tự với 3 số cuối timestamp
  const generateRandomSKU = useCallback(() => {
    // Lấy 3 số cuối timestamp
    const timestampSuffix = Date.now().toString().slice(-3)
    
    // Ký tự cho phần random (chữ in hoa + số)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    
    // Độ dài random từ 2-7 ký tự để tổng 5-10 ký tự (vì đã có 3 số timestamp)
    const randomLength = Math.floor(Math.random() * 6) + 2 // 2-7 ký tự
    
    // Tạo phần random
    let randomPart = ''
    for (let i = 0; i < randomLength; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    // Kết hợp: randomPart + 3 số timestamp
    const sku = (randomPart + timestampSuffix).toUpperCase()
    
    // Đảm bảo tổng độ dài từ 5-10 ký tự
    return sku.substring(0, 10) // Cắt nếu vượt quá 10 ký tự
  }, [])

  // Tự động tạo barcode và SKU khi mở modal
  useEffect(() => {
    if (open) {
      const newBarcode = generateBarcode()
      const newSKU = generateRandomSKU()
      
      form.setFieldsValue({
        barcode: newBarcode,
        sku: newSKU
      })
    }
  }, [open, form, generateBarcode, generateRandomSKU])

  // Lấy thông tin attribute và giá trị của chúng
  useEffect(() => {
    if (!open || productAttributes.length === 0) return

    const fetchAttributesAndValues = async () => {
      const map: Record<number, AttributeValue[]> = {}
      const attrInfoMap: Record<number, { id: number; name: string }> = {}

      await Promise.all(
        productAttributes.map(async (pa) => {
          try {
            const [attrRes, valRes] = await Promise.all([
              api.get(`/attributes/${pa.attributeId}`),
              api.get('/attribute-values', { params: { attributeId: pa.attributeId } }),
            ])
            attrInfoMap[pa.attributeId] = attrRes.data.data
            map[pa.attributeId] = valRes.data.data || []
          } catch (err) {
            console.error('Error fetching attribute data:', err)
          }
        })
      )

      setAttributeValuesMap(map)
      setAttributesInfo(attrInfoMap)
    }

    fetchAttributesAndValues()
  }, [open, productAttributes])

  // Gửi form
  const onFinish = async (values: any) => {
    try {
      // Kiểm tra chọn đủ thuộc tính
      for (const pa of productAttributes) {
        if (!selectedAttrValues[pa.attributeId]) {
          message.error('Vui lòng chọn đầy đủ giá trị cho tất cả thuộc tính')
          return
        }
      }

      const formData = new FormData()
      formData.append('sku', values.sku)
      formData.append('productId', String(productId))
      
      // Luôn có barcode (tự động tạo)
      formData.append('barcode', values.barcode || generateBarcode())
      
      formData.append('priceDelta', String(values.priceDelta ?? 0))
      formData.append('attrValues', JSON.stringify(selectedAttrValues)) // ✅ thêm JSON này như trước kia

      if (thumbFile[0]?.originFileObj) {
        formData.append('thumb', thumbFile[0].originFileObj)
      }

      await mutateAsync({ productId, formData })

      message.success('Tạo biến thể thành công')
      form.resetFields()
      setThumbFile([])
      setSelectedAttrValues({})
      onClose()
      refetch?.()
    } catch (err: any) {
      console.error('Create variant error:', err)
      message.error(err?.response?.data?.message || 'Lỗi tạo biến thể')
    }
  }

  // Reset state khi modal đóng
  useEffect(() => {
    if (!open) {
      form.resetFields()
      setThumbFile([])
      setSelectedAttrValues({})
      setAttributeValuesMap({})
    }
  }, [open, form])

  // Nút generate barcode mới
  const handleRegenerateBarcode = () => {
    const newBarcode = generateBarcode()
    form.setFieldsValue({ barcode: newBarcode })
    message.success('Đã tạo barcode mới')
  }

  // Nút generate SKU mới (ngẫu nhiên)
  const handleRegenerateSKU = () => {
    const newSKU = generateRandomSKU()
    form.setFieldsValue({ sku: newSKU })
    message.success('Đã tạo SKU mới')
  }

  if (loadingAttrs) return <Spin />

  return (
    <Modal
      title="Tạo biến thể mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={
                <div className="flex items-center justify-between">
                  <span>SKU</span>
                  <span className="text-xs text-gray-500">
                    5-10 ký tự
                  </span>
                </div>
              }
              name="sku"
              rules={[
                { required: true, message: 'Vui lòng nhập SKU' },
                { min: 5, message: 'SKU phải có ít nhất 5 ký tự' },
                { max: 10, message: 'SKU tối đa 10 ký tự' },
                { pattern: /^[A-Z0-9]+$/, message: 'SKU chỉ chứa chữ in hoa và số' }
              ]}
              extra="SKU tự động tạo ngẫu nhiên 5-10 ký tự (bao gồm 3 số cuối timestamp)"
            >
              <Input 
                placeholder="VD: XSBLK123"
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
                suffix={
                  <ReloadOutlined 
                    className="text-gray-400 cursor-pointer hover:text-blue-500" 
                    onClick={handleRegenerateSKU}
                    title="Tạo SKU mới"
                  />
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label={
                <div className="flex items-center justify-between">
                  <span>Barcode</span>
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<ReloadOutlined />}
                    onClick={handleRegenerateBarcode}
                    className="text-xs"
                  >
                    Tạo mới
                  </Button>
                </div>
              }
              name="barcode"
              rules={[
                { pattern: /^[A-Z0-9-]+$/, message: 'Barcode chỉ chứa chữ in hoa, số và dấu gạch ngang' }
              ]}
              extra="Barcode sẽ tự động tạo khi mở form"
            >
              <Input 
                placeholder="Barcode tự động tạo"
                suffix={
                  <ReloadOutlined 
                    className="text-gray-400 cursor-pointer hover:text-blue-500" 
                    onClick={handleRegenerateBarcode}
                    title="Tạo barcode mới"
                  />
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Giá biến thể"
          name="priceDelta"
          tooltip="Giá của sản phẩm."
          initialValue={0}
        >
          <InputNumber 
            min={0} 
            style={{ width: '100%' }} 
            placeholder="0"
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        </Form.Item>

        {/* Radio cho từng attribute */}
        {productAttributes.map(pa => {
          const attr = attributesInfo[pa.attributeId]
          if (!attr) return null
          return (
            <Form.Item key={pa.attributeId} label={attr.name}>
              <Radio.Group
                value={selectedAttrValues[pa.attributeId] ?? null}
                onChange={e => setSelectedAttrValues(prev => ({ ...prev, [pa.attributeId]: Number(e.target.value) }))}
                optionType="button"
                buttonStyle="solid"
                className="flex flex-wrap gap-2"
              >
                {attributeValuesMap[pa.attributeId]?.map(val => (
                  // NOTE: use val.id as radio value (attributeValueId)
                  <Radio.Button key={val.id} value={val.id}>
                    {val.value}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          )
        })}

        <Form.Item label="Ảnh đại diện">
          <Upload
            listType="picture-card"
            fileList={thumbFile}
            onChange={({ fileList }) => setThumbFile(fileList)}
            beforeUpload={createImageUploadValidator(MAX_IMAGE_SIZE_MB)}
            maxCount={1}
            accept={ACCEPTED_IMAGE_TYPES}
            onRemove={() => setThumbFile([])}
          >
            {thumbFile.length >= 1 ? null : (
              <div className="flex flex-col items-center">
                <UploadOutlined className="text-lg mb-1" />
                <div className="text-xs mt-1">Chọn ảnh</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex gap-2">
            <Button onClick={onClose} disabled={isPending} className="flex-1">
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isPending} 
              className="flex-1"
            >
              Tạo biến thể
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}