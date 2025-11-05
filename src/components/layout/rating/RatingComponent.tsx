'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, Typography, Space, Input, Rate, Form, Avatar, message, Alert } from 'antd';
import { UserOutlined, ShoppingCartOutlined, StarFilled } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ProductReview } from '@/types/product-review';
import { useAuth } from '@/context/AuthContext';
import { useProductReviewsByProduct } from '@/hooks/product-review/useProductReviewsByProduct';
import { useCreateProductReview } from '@/hooks/product-review/useCreateProductReview';
import { useUpdateProductReview } from '@/hooks/product-review/useUpdateProductReview';
import { useCheckUserPurchasedProduct } from '@/hooks/order/useCheckUserPurchasedProduct';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface RatingComponentProps {
  productId: number;
}

export default function RatingComponent({ productId }: RatingComponentProps) {
  const [form] = Form.useForm();
  const { currentUser, isLoading: isLoadingAuth } = useAuth();
  const currentUserId = currentUser?.id;
  const pathname = usePathname();
  const messageShownRef = useRef(false);

  const {
    data: purchaseData,
    isLoading: isCheckingPurchase,
    isError: isPurchaseError,
  } = useCheckUserPurchasedProduct({
    productId,
    enabled: !!currentUserId && !isLoadingAuth,
  });

  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    isError: isErrorReviews,
    error: reviewsError,
    refetch: refetchReviews,
  } = useProductReviewsByProduct({
    productId,
    page: 1,
    limit: 10,
    search: '',
    enabled: !!productId && !isLoadingAuth && currentUserId !== undefined,
  });

  const {
    mutate: createProductReview,
    isPending: isCreatingReview,
    isSuccess: isCreateSuccess,
    error: createError,
  } = useCreateProductReview();

  const {
    mutate: updateProductReview,
    isPending: isUpdatingReview,
    isSuccess: isUpdateSuccess,
    error: updateError,
  } = useUpdateProductReview();

  const [userExistingReview, setUserExistingReview] = useState<ProductReview | null>(null);

  useEffect(() => {
    if (reviewsData?.data && currentUserId !== undefined) {
      const existingReview = reviewsData.data.find(
        (review) => review.userId === currentUserId,
      );

      if (existingReview) {
        setUserExistingReview(existingReview);
        form.setFieldsValue({
          rating: existingReview.rating,
          comment: existingReview.comment || '',
        });
      } else {
        setUserExistingReview(null);
        form.resetFields();
      }
    } else if (currentUserId === undefined && !isLoadingAuth) {
      form.resetFields();
      setUserExistingReview(null);
    }
  }, [reviewsData, productId, currentUserId, form, isLoadingAuth]);

  useEffect(() => {
    if ((isCreateSuccess || isUpdateSuccess) && !messageShownRef.current) {
      message.success('Đánh giá đã được gửi thành công!');
      refetchReviews();
      messageShownRef.current = true;
    }
    if (!isCreateSuccess && !isUpdateSuccess) {
      messageShownRef.current = false;
    }
  }, [isCreateSuccess, isUpdateSuccess, refetchReviews]);

  useEffect(() => {
    if (createError) {
      message.error(`Lỗi khi gửi đánh giá: ${createError.message}`);
    }
    if (updateError) {
      message.error(`Lỗi khi cập nhật đánh giá: ${updateError.message}`);
    }
  }, [createError, updateError]);

  const handleReviewSubmit = async (values: { rating: number; comment: string }) => {
    if (values.rating === 0) {
      message.error('Vui lòng chọn số sao đánh giá!');
      return;
    }

    if (!currentUserId) {
      message.error('Bạn phải đăng nhập để gửi đánh giá.');
      return;
    }

    if (!purchaseData?.hasPurchased && !userExistingReview) {
      message.error('Bạn cần mua sản phẩm này trước khi đánh giá!');
      return;
    }

    messageShownRef.current = false;

    try {
      if (userExistingReview) {
        updateProductReview({
          id: userExistingReview.id,
          data: {
            rating: values.rating,
            comment: values.comment || undefined,
          },
        });
      } else {
        createProductReview({
          productId,
          userId: currentUserId,
          rating: values.rating,
          comment: values.comment || undefined,
          orderId: purchaseData?.orderId || undefined,
          orderItemId: purchaseData?.orderItemId || undefined,
          isPurchased: true,
        });
      }
    } catch (error) {
      // Error handled by useEffect
    }
  };

  if (isLoadingReviews || isLoadingAuth || isCheckingPurchase) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (isErrorReviews) {
    return (
      <div className="text-center py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-red-600 font-medium">Lỗi khi tải đánh giá: {reviewsError?.message}</p>
        </div>
      </div>
    );
  }

  const reviews = reviewsData?.data || [];
  const loginUrl = `/login?returnUrl=${encodeURIComponent(pathname)}`;
  const hasPurchased = purchaseData?.hasPurchased || false;

  return (
    <div className="container mx-auto">
      {/* Your Review Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
            <StarFilled className="text-white text-xl" />
          </div>
          <Title level={3} className="!mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
            Đánh giá của bạn
          </Title>
        </div>
      
        {currentUserId ? (
          <div className="max-w-3xl">
            {/* Purchase Alert */}
            {!hasPurchased && !userExistingReview && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                    <ShoppingCartOutlined className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Chưa thể đánh giá</h4>
                    <p className="text-gray-600 mb-3">
                      Bạn cần mua sản phẩm này trước khi có thể đánh giá.
                    </p>
                    <Link 
                      href="/tai-khoan?p=history" 
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                    >
                      <ShoppingCartOutlined />
                      Xem đơn hàng của tôi
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Error Alert */}
            {isPurchaseError && !userExistingReview && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-full flex-shrink-0">
                    <span className="text-amber-600 text-xl">⚠️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Không thể kiểm tra trạng thái mua hàng</h4>
                    <p className="text-gray-600">Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Review Form */}
            {(hasPurchased || userExistingReview) && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 hover:shadow-xl transition-shadow duration-300">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleReviewSubmit}
                >
                  <Form.Item
                    label={<span className="text-gray-700 font-semibold text-base">Xếp hạng của bạn</span>}
                    name="rating"
                    rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá!' }]}
                  >
                    <Rate 
                      disabled={isCreatingReview || isUpdatingReview}
                      className="text-3xl"
                      style={{ color: '#fbbf24' }}
                    />
                  </Form.Item>
                  
                  <Form.Item 
                    label={<span className="text-gray-700 font-semibold text-base">Bình luận của bạn</span>}
                    name="comment"
                  >
                    <TextArea
                      rows={5}
                      placeholder="Chia sẻ suy nghĩ của bạn về sản phẩm..."
                      disabled={isCreatingReview || isUpdatingReview}
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </Form.Item>
                  
                  <Form.Item className="mb-0">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isCreatingReview || isUpdatingReview}
                      className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 rounded-xl font-semibold text-base shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      {userExistingReview ? '✨ Cập nhật đánh giá' : '🚀 Gửi đánh giá'}
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-2xl p-8 max-w-3xl shadow-sm">
            <p className="text-gray-700 text-lg">
              Đăng nhập để gửi đánh giá.{' '}
              <Link 
                href={loginUrl} 
                className="text-blue-600 hover:text-blue-700 font-semibold underline hover:no-underline transition-colors"
              >
                Đăng nhập ngay →
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-xl">
            <UserOutlined className="text-white text-xl" />
          </div>
          <Title level={3} className="!mb-0 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
            Đánh giá của khách hàng
          </Title>
          {reviews.length > 0 && (
            <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
              {reviews.length} đánh giá
            </span>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">💭</div>
            <p className="text-gray-600 text-lg">Chưa có đánh giá nào từ khách hàng.</p>
            <p className="text-gray-500 text-sm mt-2">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                  {review.user && (
                    <div className="flex items-center gap-3">
                      <Avatar
                        size={48}
                        icon={<UserOutlined />}
                        className="bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0"
                      />
                      <div>
                        <Text strong className="text-gray-800 text-base block">{review.user.name}</Text>
                        <Text className="text-gray-500 text-sm">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                      </div>
                    </div>
                  )}
                  <div className="sm:ml-auto">
                    <Rate
                      disabled
                      value={review.rating}
                      className="text-xl"
                      style={{ color: '#fbbf24' }}
                    />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border-l-4 border-blue-500">
                  <Paragraph className="mb-0 text-gray-700 leading-relaxed">
                    {review.comment || <span className="text-gray-400 italic">Không có bình luận.</span>}
                  </Paragraph>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ant-rate-star {
          transition: all 0.3s ease;
        }

        .ant-rate-star:hover {
          transform: scale(1.1);
        }

        .ant-form-item-label > label {
          font-size: 15px;
        }

        .ant-input-textarea textarea {
          font-size: 15px;
        }

        .ant-input-textarea textarea:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}