'use client'

import PromotionProductTable from '@/components/admin/promotion-product/PromotionProductTable'
import { Typography, Breadcrumb } from 'antd'
import { useParams, useRouter } from 'next/navigation'
const { Title } = Typography

export default function PromotionProductPage() {
  const params = useParams()
  const router = useRouter()
  const promotionId = params.promotionId ? Number(params.promotionId) : undefined

  if (!promotionId) return <div>Không tìm thấy chương trình khuyến mãi</div>

  return (
    <div className="p-4">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Breadcrumb>
          <Breadcrumb.Item>
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/admin/promotion`)}
            >
              Danh sách chương trình khuyến mãi
            </span>
          </Breadcrumb.Item>

          <Breadcrumb.Item>Danh sách sản phẩm khuyến mãi</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* Render the PromotionProductTable passing the promotionId */}
      <PromotionProductTable promotionId={promotionId} />
    </div>
  )
}
