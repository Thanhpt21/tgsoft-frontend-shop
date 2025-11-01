'use client'

import { Modal, Form, Input, Button, Upload, message, Row, Col, InputNumber, Spin, Radio } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import type { UploadFile } from 'antd/es/upload/interface'
import { useUpdateProductVariant } from '@/hooks/product-variant/useUpdateProductVariant'
import { useProductAttributes } from '@/hooks/product-attribute/useProductAttributes'
import { useAllAttributes } from '@/hooks/attribute/useAllAttributes'
import { useAttributeValues } from '@/hooks/attribute-value/useAttributeValues'
import { createImageUploadValidator, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '@/utils/upload.utils'
import { getImageUrl } from '@/utils/getImageUrl'
import type { ProductVariant } from '@/types/product-variant.type'

interface VariantUpdateModalProps {
  open: boolean
  onClose: () => void
  variant: ProductVariant | null
  refetch?: () => void
}

export const VariantUpdateModal = ({ open, onClose, variant, refetch }: VariantUpdateModalProps) => {
  const [form] = Form.useForm()
  const [thumbFile, setThumbFile] = useState<UploadFile[]>([])
  const [selectedAttrValues, setSelectedAttrValues] = useState<Record<number, number>>({})
  const { mutateAsync, isPending } = useUpdateProductVariant()

  const productId = variant?.productId ?? 0
  const { data: productAttributesData, isLoading: loadingAttrs } = useProductAttributes(Number(productId))
  const { data: allAttributes } = useAllAttributes()
  const { data: allAttrValuesResponse } = useAttributeValues()
  const allAttrValues = allAttrValuesResponse?.data || []

  const productAttributes = Array.isArray(productAttributesData) ? productAttributesData : []

  // Map attributeId -> name
  const attributeInfoMap: Record<number, string> = {}
  allAttributes?.forEach((attr: any) => {
    attributeInfoMap[attr.id] = attr.name
  })

  // Map attributeId -> [values]
  const attributeValuesMap: Record<number, any[]> = {}
  allAttrValues.forEach((val: any) => {
    if (!attributeValuesMap[val.attributeId]) attributeValuesMap[val.attributeId] = []
    attributeValuesMap[val.attributeId].push(val)
  })


  useEffect(() => {
    if (variant && open) {
      form.setFieldsValue({
        sku: variant.sku,
        barcode: variant.barcode ?? '',
        priceDelta: variant.priceDelta ?? 0,
      })


      if (variant.attrValues) {
        const selected: Record<number, number> = {}
        for (const [attrId, valId] of Object.entries(variant.attrValues || {})) {
          selected[Number(attrId)] = Number(valId)
        }
        setSelectedAttrValues(selected)
      }

      // ✅ Ảnh thumb
      if (variant.thumb) {
        const url = getImageUrl(variant.thumb)
        if (url) {
          setThumbFile([
            {
              uid: '-1',
              name: variant.thumb.split('/').pop() || 'thumb.png',
              status: 'done',
              url: url,
            },
          ])
        }
      }
    } else if (!open) {
      form.resetFields()
      setThumbFile([])
      setSelectedAttrValues({})
    }
  }, [variant, open])

const onFinish = async (values: any) => {
  if (!variant) return
  try {
    // Lọc chỉ attributeId hiện có của product
    const newAttrValues: Record<number, number> = {}
    for (const pa of productAttributes) {
      const selectedValue = selectedAttrValues[pa.attributeId]
      if (!selectedValue) {
        message.error('Vui lòng chọn đầy đủ giá trị cho tất cả thuộc tính')
        return
      }
      newAttrValues[pa.attributeId] = selectedValue
    }

    const formData = new FormData()
    formData.append('sku', values.sku)
    formData.append('barcode', values.barcode || '')
    formData.append('priceDelta', String(values.priceDelta ?? 0))
    formData.append('attrValues', JSON.stringify(newAttrValues))

    if (thumbFile[0]?.originFileObj) {
      formData.append('thumb', thumbFile[0].originFileObj)
    }

    await mutateAsync({ id: variant.id, formData })

    message.success('Cập nhật biến thể thành công')
    form.resetFields()
    setThumbFile([])
    setSelectedAttrValues({})
    onClose()
    refetch?.()
  } catch (err: any) {
    console.error('❌ Update variant error:', err)
    message.error(err?.response?.data?.message || 'Lỗi cập nhật biến thể')
  }
}
  if ((loadingAttrs || !allAttributes || !allAttrValuesResponse) && open) return <Spin />

  return (
    <Modal
      title="Cập nhật biến thể"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="SKU" name="sku" rules={[{ required: true, message: 'Vui lòng nhập SKU' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Barcode" name="barcode">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Giá biến thể"
          name="priceDelta"
          tooltip="Giá của sản phẩm."
          initialValue={0}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        {/* ✅ Radio group cho từng attribute */}
        {productAttributes.map((pa) => {
          const attrName = attributeInfoMap[pa.attributeId]
          if (!attrName) return null
          const values = attributeValuesMap[pa.attributeId] || []

          return (
            <Form.Item key={pa.attributeId} label={attrName}>
              <Radio.Group
                value={selectedAttrValues[pa.attributeId] ?? null}
                onChange={(e) =>
                  setSelectedAttrValues((prev) => ({
                    ...prev,
                    [pa.attributeId]: Number(e.target.value),
                  }))
                }
              >
                {values.map((val) => (
                  <Radio key={val.id} value={val.id}>
                    {val.value}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          )
        })}

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

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
