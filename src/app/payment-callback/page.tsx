// app/payment-callback/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Result, Button, Alert, Spin, Descriptions } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { useCartStore } from '@/stores/cartStore';
import { useRemoveCartItem } from '@/hooks/cart/useRemoveCartItem';
import axios from 'axios';

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const { selectedItems, clearSelectedItems, removeItemOptimistic } = useCartStore();
  const { mutate: removeCartItem } = useRemoveCartItem();

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // 🔥 LẤY PARAMS TỪ URL (VNPay sẽ redirect với query parameters)
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_TxnRef = searchParams.get('vnp_TxnRef'); // orderId
        const vnp_Amount = searchParams.get('vnp_Amount');
        const vnp_TransactionNo = searchParams.get('vnp_TransactionNo');
        const vnp_BankCode = searchParams.get('vnp_BankCode');
        const vnp_PayDate = searchParams.get('vnp_PayDate');

        console.log('VNPay Callback Params:', {
          vnp_ResponseCode,
          vnp_TxnRef,
          vnp_Amount,
          vnp_TransactionNo,
          vnp_BankCode,
          vnp_PayDate
        });

        // 🔥 KIỂM TRA MÃ PHẢN HỒI
        if (vnp_ResponseCode === '00') {
          setStatus('success');
          setMessage('Thanh toán thành công!');
          
          // Lưu thông tin đơn hàng
          setOrderInfo({
            orderId: vnp_TxnRef,
            amount: vnp_Amount ? parseInt(vnp_Amount) / 100 : 0, // VNPay gửi amount * 100
            transactionNo: vnp_TransactionNo,
            bankCode: vnp_BankCode,
            payDate: vnp_PayDate,
          });

          // 🔥 XÓA ITEMS TRONG GIỎ HÀNG SAU KHI THANH TOÁN THÀNH CÔNG
          selectedItems.forEach(itemId => {
            removeCartItem(itemId);
            removeItemOptimistic(itemId);
          });
          clearSelectedItems();

          // 🔥 CÓ THỂ GỌI API ĐỂ XÁC NHẬN LẠI TRẠNG THÁI ĐƠN HÀNG
          if (vnp_TxnRef) {
            try {
              await axios.patch(`https://api.aiban.vn/orders/${vnp_TxnRef}/payment-success`, {
                transactionNo: vnp_TransactionNo,
                bankCode: vnp_BankCode,
                payDate: vnp_PayDate,
              });
            } catch (confirmError) {
              console.error('Lỗi xác nhận thanh toán:', confirmError);
            }
          }

        } else {
          setStatus('error');
          // Map mã lỗi VNPay sang message thân thiện
          const errorMessages: { [key: string]: string } = {
            '01': 'Giao dịch đã tồn tại',
            '02': 'Merchant không hợp lệ',
            '03': 'Dữ liệu gửi sang không đúng định dạng',
            '04': 'Khởi tạo GD không thành công do số tiền không hợp lệ',
            '05': 'Giao dịch không thành công do số tiền thanh toán vượt quá hạn mức',
            '06': 'Giao dịch không thành công do tài khoản của quý khách không đủ số dư',
            '07': 'Giao dịch bị nghi ngờ gian lận',
            '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking',
            '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
            '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
            '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
            '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
            '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
            '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
            '75': 'Ngân hàng thanh toán đang bảo trì',
            '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
            '99': 'Các lỗi khác',
          };
          
          const errorMessage = errorMessages[vnp_ResponseCode || '99'] || 'Thanh toán thất bại';
          setMessage(errorMessage);
        }
      } catch (error) {
        console.error('Lỗi xử lý callback:', error);
        setStatus('error');
        setMessage('Có lỗi xảy ra khi xử lý kết quả thanh toán');
      }
    };

    processPaymentResult();
  }, [searchParams, selectedItems, removeCartItem, removeItemOptimistic, clearSelectedItems]);

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleViewOrder = () => {
    if (orderInfo?.orderId) {
      router.push(`/tai-khoan?p=history&order=${orderInfo.orderId}`);
    } else {
      router.push('/tai-khoan?p=history');
    }
  };

  const handleRetryPayment = () => {
    if (orderInfo?.orderId) {
      router.push(`/thanh-toan?orderId=${orderInfo.orderId}`);
    } else {
      router.push('/gio-hang');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8 max-w-md w-full mx-4">
          <Spin size="large" />
          <div className="mt-4 text-gray-600 text-lg">Đang xử lý kết quả thanh toán...</div>
          <div className="mt-2 text-gray-500 text-sm">Vui lòng không đóng trang này</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 bg-gray-50">
      <Card className="max-w-2xl w-full mx-4 !rounded-3xl !border-2 shadow-2xl">
        {status === 'success' ? (
          <Result
            icon={<CheckCircleFilled className="text-green-500" style={{ fontSize: 72 }} />}
            title={<span className="text-3xl font-bold text-green-600">Thanh Toán Thành Công!</span>}
            subTitle={
              <div className="text-lg text-gray-600 mt-4">
                <p>Cảm ơn bạn đã mua hàng!</p>
                <p className="mt-2">Đơn hàng của bạn đang được xử lý và sẽ được giao sớm.</p>
              </div>
            }
            extra={[
              <Button 
                type="primary" 
                key="orders" 
                size="large"
                onClick={handleViewOrder}
                className="mb-3 !h-12 !px-8 !rounded-xl !bg-gradient-to-r !from-blue-500 !to-purple-500 hover:!from-blue-600 hover:!to-purple-600"
              >
                Xem đơn hàng
              </Button>,
              <Button 
                key="shop" 
                size="large"
                onClick={handleBackToHome}
                className="!h-12 !px-8 !rounded-xl"
              >
                Về trang chủ
              </Button>,
            ]}
          />
        ) : (
          <Result
            icon={<CloseCircleFilled className="text-red-500" style={{ fontSize: 72 }} />}
            title={<span className="text-3xl font-bold text-red-600">Thanh Toán Thất Bại</span>}
            subTitle={
              <div className="text-lg text-gray-600 mt-4">
                <p>{message}</p>
                <p className="mt-2">Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
              </div>
            }
            extra={[
              <Button 
                type="primary" 
                key="retry" 
                size="large"
                onClick={handleRetryPayment}
                className="mb-3 !h-12 !px-8 !rounded-xl !bg-gradient-to-r !from-orange-500 !to-red-500 hover:!from-orange-600 hover:!to-red-600"
              >
                Thử lại thanh toán
              </Button>,
              <Button 
                key="cart" 
                size="large"
                onClick={() => router.push('/gio-hang')}
                className="!h-12 !px-8 !rounded-xl"
              >
                Quay lại giỏ hàng
              </Button>,
            ]}
          />
        )}

        {/* Hiển thị thông tin chi tiết giao dịch */}
        {orderInfo && (
          <Alert
            message="Thông tin giao dịch"
            description={
              <Descriptions column={1} size="small" className="mt-2">
                <Descriptions.Item label="Mã đơn hàng">
                  <strong>#{orderInfo.orderId}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền">
                  <strong>{(orderInfo.amount).toLocaleString()} VND</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Mã giao dịch">
                  {orderInfo.transactionNo}
                </Descriptions.Item>
                {orderInfo.bankCode && (
                  <Descriptions.Item label="Ngân hàng">
                    {orderInfo.bankCode}
                  </Descriptions.Item>
                )}
                {orderInfo.payDate && (
                  <Descriptions.Item label="Thời gian">
                    {orderInfo.payDate}
                  </Descriptions.Item>
                )}
              </Descriptions>
            }
            type="info"
            className="mt-6"
          />
        )}
      </Card>
    </div>
  );
}