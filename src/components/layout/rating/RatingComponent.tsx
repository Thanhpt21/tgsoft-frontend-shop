'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, Typography, Space, Input, Rate, Form, Avatar, message, Divider } from 'antd';
import { UserOutlined, ShoppingCartOutlined, StarFilled, MessageOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ProductReview } from '@/types/product-review';
import { useAuth } from '@/context/AuthContext';
import { useProductReviewsByProduct } from '@/hooks/product-review/useProductReviewsByProduct';
import { useCreateProductReview } from '@/hooks/product-review/useCreateProductReview';
import { useUpdateProductReview } from '@/hooks/product-review/useUpdateProductReview';
import { useCheckUserPurchasedProduct } from '@/hooks/order/useCheckUserPurchasedProduct';

const { Title, Text } = Typography;
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
  const [ratingStats, setRatingStats] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
    total: 0,
    average: 0
  });

  // Tính toán rating stats
  useEffect(() => {
    if (reviewsData?.data) {
      const reviews = reviewsData.data;
      const stats = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
        total: reviews.length,
        average: 0
      };

      reviews.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
          stats[review.rating as keyof typeof stats]++;
        }
      });

      const totalScore = reviews.reduce((sum, review) => sum + review.rating, 0);
      stats.average = reviews.length > 0 ? totalScore / reviews.length : 0;

      setRatingStats(stats);
    }
  }, [reviewsData]);

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

  const getRatingPercentage = (rating: number) => {
    if (ratingStats.total === 0) return 0;
    return Math.round((ratingStats[rating as keyof typeof ratingStats] / ratingStats.total) * 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hôm nay';
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 30) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  if (isLoadingReviews || isLoadingAuth || isCheckingPurchase) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const reviews = reviewsData?.data || [];
  const loginUrl = `/login?returnUrl=${encodeURIComponent(pathname)}`;
  const hasPurchased = purchaseData?.hasPurchased || false;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Rating Summary Section */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {ratingStats.average.toFixed(1)}
            </div>
            <Rate 
              disabled 
              value={ratingStats.average} 
              className="text-lg mb-2"
              style={{ color: '#fbbf24' }}
            />
            <div className="text-gray-600 text-sm">
              {ratingStats.total} đánh giá
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="md:col-span-2 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const percentage = getRatingPercentage(star);
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="w-12 text-gray-600 text-sm font-medium">
                    {star} sao
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-gray-600 text-sm">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Reviews List */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MessageOutlined className="text-blue-600 text-xl" />
              <Title level={4} className="!mb-0 !text-gray-900 font-semibold">
                Đánh giá của khách hàng
              </Title>
              <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
                {ratingStats.total}
              </span>
            </div>
            
          
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-4">💭</div>
                <p className="text-gray-600">Chưa có đánh giá nào</p>
                <p className="text-gray-400 text-sm mt-1">
                  Hãy là người đầu tiên đánh giá sản phẩm này!
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white p-5 rounded-xl border hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar
                      size={40}
                      icon={<UserOutlined />}
                      className="bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <Text strong className="text-gray-900">
                            {review.user?.name || 'Khách hàng'}
                          </Text>
                          <Text className="text-gray-500 text-xs ml-2">
                            {formatDate(review.createdAt)}
                          </Text>
                        </div>
                        <Rate
                          disabled
                          value={review.rating}
                          className="text-sm"
                          style={{ color: '#fbbf24' }}
                        />
                      </div>
                      
                      {review.isPurchased && (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          <ShoppingCartOutlined className="text-xs" />
                          Đã mua hàng
                        </span>
                      )}
                    </div>
                  </div>

                  {review.comment && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-gray-700 leading-relaxed mb-0">
                        {review.comment}
                      </p>
                    </div>
                  )}

                 
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Your Review Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-2 mb-6">
                <StarFilled className="text-yellow-500" />
                <Title level={4} className="!mb-0 !text-gray-900 font-semibold">
                  Đánh giá của bạn
                </Title>
              </div>

              {!currentUserId ? (
                <div className="text-center p-6">
                  <UserOutlined className="text-gray-400 text-3xl mb-3" />
                  <p className="text-gray-600 mb-4">
                    Đăng nhập để gửi đánh giá
                  </p>
                  <Link href={loginUrl}>
                    <Button type="primary" className="w-full">
                      Đăng nhập ngay
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  {/* Purchase Requirement Warning */}
                  {!hasPurchased && !userExistingReview && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <ShoppingCartOutlined className="text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-yellow-800 font-medium text-sm mb-1">
                            Bạn cần mua sản phẩm này trước khi đánh giá
                          </p>
                          <p className="text-yellow-600 text-xs">
                            Chỉ khách hàng đã mua hàng mới có thể đánh giá
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Review Form */}
                  {(hasPurchased || userExistingReview) && (
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleReviewSubmit}
                    >
                      <Form.Item
                        name="rating"
                        rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
                        className="mb-6"
                      >
                        <div className="text-center">
                          <Rate 
                            className="text-2xl"
                            style={{ color: '#fbbf24' }}
                          />
                          <div className="text-gray-500 text-sm mt-2">
                            Chọn số sao đánh giá
                          </div>
                        </div>
                      </Form.Item>

                      <Form.Item name="comment" className="mb-6">
                        <TextArea
                          rows={5}
                          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                          className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </Form.Item>

                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isCreatingReview || isUpdatingReview}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 rounded-lg font-semibold shadow-sm hover:shadow transition-all"
                      >
                        {userExistingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                      </Button>
                    </Form>
                  )}
                </div>
              )}
            </div>

            {/* Tips for Review */}
            <div className="mt-4 text-gray-500 text-sm">
              <p className="mb-2 font-medium text-gray-700">Gợi ý khi đánh giá:</p>
              <ul className="space-y-1">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                  <span>Chia sẻ trải nghiệm thực tế</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                  <span>Đề cập đến chất lượng sản phẩm</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                  <span>Trung thực và khách quan</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}