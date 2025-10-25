'use client'

import VariantTable from '@/components/admin/variant/VariantTable'
import { Typography, Breadcrumb } from 'antd'
import { useParams, useRouter } from 'next/navigation'
import { HomeOutlined } from '@ant-design/icons'

const { Title } = Typography

export default function ProductVariantPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.productId ? Number(params.productId) : undefined

  if (!productId) return <div>Không tìm thấy sản phẩm</div>

  return (
    <div className="p-4">
      {/* Breadcrumb */}
      <div  className="mb-4">
      <Breadcrumb>
        <Breadcrumb.Item>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => router.push(`/admin/product`)}
          >
            Chi tiết sản phẩm
          </span>
        </Breadcrumb.Item>

        <Breadcrumb.Item>Danh sách biến thể</Breadcrumb.Item>
      </Breadcrumb>
      </div>
     

      <VariantTable productId={productId} />
    </div>
  )
}
