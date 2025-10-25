'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Button, Space, Spin, message, Card, Divider, Modal } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const { Title, Text } = Typography;

const formatPaymentDate = (payDate: string) => {
  const year = payDate.slice(0, 4);
  const month = payDate.slice(4, 6);
  const day = payDate.slice(6, 8);
  const hour = payDate.slice(8, 10);
  const minute = payDate.slice(10, 12);
  const second = payDate.slice(12, 14);
  
  const formattedDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  
  return formattedDate.toLocaleString('vi-VN');
};

export default function OrderConfirmationPage() {
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lấy query params từ URL
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const transactionNo = searchParams.get('transactionNo');
  const errorMessage = searchParams.get('message');
  const paymentDate = searchParams.get('payDate'); 
  const bankCode = searchParams.get('bankCode'); 

  useEffect(() => {
    if (status) {
      if (status === 'success') {
        setPaymentResult({
          success: true,
          message: 'Thanh toán thành công!',
          data: {
            orderId: orderId,
            amount: amount,
            transactionNo: transactionNo,
            payDate: paymentDate,
            bankCode: bankCode,
          },
        });
      } else {
        setPaymentResult({
          success: false,
          message: errorMessage || 'Thanh toán thất bại. Vui lòng thử lại.',
          data: { orderId: orderId },
        });
      }
      setLoading(false);
    } else {
      message.error('Không nhận được kết quả thanh toán!');
      setLoading(false);
    }
  }, [status, orderId, amount, transactionNo, errorMessage, paymentDate, bankCode]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin tip="Đang tải kết quả thanh toán..." size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 max-w-4xl" style={{ backgroundImage: "url('https://via.placeholder.com/1500x1000')" }}>
      {/* Full-screen background with content in a centered card */}
      <div className="flex justify-center items-center min-h-screen bg-opacity-60">
        <Card className="shadow-xl p-8" style={{ backgroundColor: '#ffffff90', maxWidth: '600px', width: '100%' }}>
          {paymentResult ? (
            <>
              {/* Icon and Title */}
              <div className="text-center mb-6">
                {paymentResult.success ? (
                  <CheckCircleOutlined className="text-6xl text-green-600 mb-4" />
                ) : (
                  <CloseCircleOutlined className="text-6xl text-red-600 mb-4" />
                )}
                <Title level={2} className={paymentResult.success ? 'text-green-600' : 'text-red-600'}>
                  {paymentResult.success ? 'Đặt hàng thành công!' : 'Đặt hàng thất bại!'}
                </Title>
                <Text className="text-lg">
                  {paymentResult.message}
                </Text>
              </div>

              <Divider />

              {/* Order details */}
              <div className="mb-6">
                <div className="space-y-3">
                  {paymentResult.data.orderId && (
                    <div className="flex justify-between">
                      <Text strong>Mã đơn hàng:</Text>
                      <Text>{paymentResult.data.orderId}</Text>
                    </div>
                  )}
                  {paymentResult.data.amount && (
                    <div className="flex justify-between">
                      <Text strong>Tổng tiền:</Text>
                      <Text className="text-lg text-green-600 font-semibold">
                        {parseInt(paymentResult.data.amount).toLocaleString('vi-VN')} VNĐ
                      </Text>
                    </div>
                  )}
                  {paymentResult.data.transactionNo && (
                    <div className="flex justify-between">
                      <Text strong>Mã giao dịch:</Text>
                      <Text>{paymentResult.data.transactionNo}</Text>
                    </div>
                  )}
                  {paymentResult.data.payDate && (
                    <div className="flex justify-between">
                      <Text strong>Ngày thanh toán:</Text>
                      <Text>{formatPaymentDate(paymentResult.data.payDate)}</Text>
                    </div>
                  )}
                  {paymentResult.data.bankCode && (
                    <div className="flex justify-between">
                      <Text strong>Ngân hàng thanh toán:</Text>
                      <Text>{paymentResult.data.bankCode}</Text>
                    </div>
                  )}
                </div>
              </div>

              <Divider />

              {/* Action buttons */}
              <div className="text-center">
                <Space size="large" wrap>
                  <Link href="/tai-khoan?p=history" passHref>
                    <Button type="primary" size="large">
                      Xem đơn hàng của tôi
                    </Button>
                  </Link>
                  <Link href="/san-pham" passHref>
                    <Button size="large">
                      Tiếp tục mua sắm
                    </Button>
                  </Link>
                </Space>
              </div>
            </>
          ) : (
            <div className="text-center">
              <Text type="danger" className="text-lg">
                Có lỗi xảy ra trong quá trình thanh toán.
              </Text>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
