'use client';


import CouponTable from '@/components/admin/coupon/CouponTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminCouponPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách mã giảm giá</Title>
      <CouponTable />
    </div>
  );
}