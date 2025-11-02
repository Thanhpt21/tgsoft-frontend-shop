'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Button, Space, Spin, message, Card, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ShoppingOutlined, HistoryOutlined } from '@ant-design/icons';
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
  const [animate, setAnimate] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

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
      setTimeout(() => setAnimate(true), 100);
    } else {
      message.error('Không nhận được kết quả thanh toán!');
      setLoading(false);
    }
  }, [status, orderId, amount, transactionNo, errorMessage, paymentDate, bankCode]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <div className="text-center">
          <Spin tip="Đang tải kết quả thanh toán..." size="large" />
          <style jsx>{`
            :global(.ant-spin-text) {
              color: white;
              font-size: 16px;
              margin-top: 12px;
            }
            :global(.ant-spin-dot-item) {
              background-color: white;
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className={`relative z-10 w-full max-w-lg transition-all duration-700 transform ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <Card 
          className="backdrop-blur-xl bg-white/95 shadow-2xl border-0 rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        >
          {paymentResult ? (
            <div className="p-6 md:p-8">
              {/* Icon and Title */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  paymentResult.success 
                    ? 'bg-gradient-to-br from-green-400 to-emerald-600' 
                    : 'bg-gradient-to-br from-red-400 to-rose-600'
                } shadow-lg animate-bounce`} style={{ animationDuration: '2s' }}>
                  {paymentResult.success ? (
                    <CheckCircleOutlined className="text-3xl text-white" />
                  ) : (
                    <CloseCircleOutlined className="text-3xl text-white" />
                  )}
                </div>
                
                <Title level={2} className="mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {paymentResult.success ? 'Đặt hàng thành công!' : 'Đặt hàng thất bại!'}
                </Title>
                
                <Text className="text-base text-gray-600">
                  {paymentResult.message}
                </Text>
              </div>

              {/* Order details with gradient card */}
              {paymentResult.success && (
                <div className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="space-y-3">
                    {paymentResult.data.orderId && (
                      <div className="flex justify-between items-center py-1.5 border-b border-purple-100 last:border-0">
                        <Text strong className="text-gray-700 text-sm">Mã đơn hàng:</Text>
                        <Text className="text-sm font-mono bg-white px-2 py-1 rounded">{paymentResult.data.orderId}</Text>
                      </div>
                    )}
                    {paymentResult.data.amount && (
                      <div className="flex justify-between items-center py-1.5 border-b border-purple-100 last:border-0">
                        <Text strong className="text-gray-700 text-sm">Tổng tiền:</Text>
                        <Text className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {parseInt(paymentResult.data.amount).toLocaleString('vi-VN')} ₫
                        </Text>
                      </div>
                    )}
                    {paymentResult.data.transactionNo && (
                      <div className="flex justify-between items-center py-1.5 border-b border-purple-100 last:border-0">
                        <Text strong className="text-gray-700 text-sm">Mã giao dịch:</Text>
                        <Text className="text-sm font-mono bg-white px-2 py-1 rounded">{paymentResult.data.transactionNo}</Text>
                      </div>
                    )}
                    {paymentResult.data.payDate && (
                      <div className="flex justify-between items-center py-1.5 border-b border-purple-100 last:border-0">
                        <Text strong className="text-gray-700 text-sm">Ngày thanh toán:</Text>
                        <Text className="text-sm">{formatPaymentDate(paymentResult.data.payDate)}</Text>
                      </div>
                    )}
                    {paymentResult.data.bankCode && (
                      <div className="flex justify-between items-center py-1.5">
                        <Text strong className="text-gray-700 text-sm">Ngân hàng:</Text>
                        <Text className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{paymentResult.data.bankCode}</Text>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons with modern style */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/tai-khoan?p=history" passHref className="flex-1 sm:flex-none">
                  <Button 
                    type="primary" 
                    size="middle"
                    icon={<HistoryOutlined />}
                    className="w-full sm:w-auto h-11 text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      transform: 'translateY(0)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    Xem đơn hàng
                  </Button>
                </Link>
                
                <Link href="/san-pham" passHref className="flex-1 sm:flex-none">
                  <Button 
                    size="middle"
                    icon={<ShoppingOutlined />}
                    className="w-full sm:w-auto h-11 text-sm font-semibold rounded-lg border-2 hover:border-purple-500 transition-all duration-300"
                    style={{
                      borderColor: '#667eea',
                      color: '#667eea',
                      transform: 'translateY(0)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#667eea';
                      e.currentTarget.style.borderColor = '#667eea';
                    }}
                  >
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center p-12">
              <CloseCircleOutlined className="text-6xl text-red-500 mb-4" />
              <Text type="danger" className="text-xl font-semibold">
                Có lỗi xảy ra trong quá trình thanh toán.
              </Text>
            </div>
          )}
        </Card>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-bounce {
          animation: bounce 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}