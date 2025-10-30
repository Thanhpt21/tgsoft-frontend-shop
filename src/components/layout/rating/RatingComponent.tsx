'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, Typography, Space, Input, Rate, Form, Avatar, message, Alert } from 'antd';
import { UserOutlined, ShoppingCartOutlined } from '@ant-design/icons';
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

  // ✅ Check purchase status
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

    // ✅ Kiểm tra đã mua sản phẩm chưa (trừ khi đã có review)
    if (!purchaseData?.hasPurchased && !userExistingReview) {
      message.error('Bạn cần mua sản phẩm này trước khi đánh giá!');
      return;
    }

    messageShownRef.current = false;

    try {
      if (userExistingReview) {
        // Update existing review
        updateProductReview({
          id: userExistingReview.id,
          data: {
            rating: values.rating,
            comment: values.comment || undefined,
          },
        });
      } else {
        // Create new review với orderId và orderItemId
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
    return <div className="text-center py-4 text-gray-600">Đang tải đánh giá...</div>;
  }

  if (isErrorReviews) {
    return (
      <div className="text-center py-4 text-red-500">
        Lỗi khi tải đánh giá: {reviewsError?.message}
      </div>
    );
  }

  const reviews = reviewsData?.data || [];
  const loginUrl = `/login?returnUrl=${encodeURIComponent(pathname)}`;
  const hasPurchased = purchaseData?.hasPurchased || false;

  return (
    <div className="container mx-auto">
      <Title level={4} className="mb-4">Đánh giá của bạn</Title>
      
      {currentUserId ? (
        <>
          {/* ✅ Alert khi chưa mua sản phẩm */}
          {!hasPurchased && !userExistingReview && (
            <Alert
              message="Chưa thể đánh giá"
              description={
                <div>
                  <p className="mb-2">
                    Bạn cần mua sản phẩm này trước khi có thể đánh giá.
                  </p>
                  <Link href="/tai-khoan?p=history" className="text-blue-500 hover:underline">
                    <ShoppingCartOutlined className="mr-1" />
                    Xem đơn hàng của tôi
                  </Link>
                </div>
              }
              type="info"
              showIcon
              className="mb-4 max-w-2xl"
            />
          )}

          {/* ✅ Alert khi có lỗi check purchase */}
          {isPurchaseError && !userExistingReview && (
            <Alert
              message="Không thể kiểm tra trạng thái mua hàng"
              description="Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
              type="warning"
              showIcon
              className="mb-4 max-w-2xl"
            />
          )}

          {/* ✅ Form đánh giá - chỉ hiện khi đã mua HOẶC đã có review */}
          {(hasPurchased || userExistingReview) && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleReviewSubmit}
              className="max-w-2xl"
            >
              <Form.Item
                label="Xếp hạng của bạn"
                name="rating"
                rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá!' }]}
              >
                <Rate disabled={isCreatingReview || isUpdatingReview} />
              </Form.Item>
              <Form.Item label="Bình luận của bạn" name="comment">
                <TextArea
                  rows={4}
                  placeholder="Chia sẻ suy nghĩ của bạn về sản phẩm..."
                  disabled={isCreatingReview || isUpdatingReview}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCreatingReview || isUpdatingReview}
                >
                  {userExistingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                </Button>
              </Form.Item>
            </Form>
          )}
        </>
      ) : (
        <p className="text-gray-600 max-w-2xl">
          Đăng nhập để gửi đánh giá.{' '}
          <Link href={loginUrl} className="text-blue-500 underline hover:no-underline font-medium">
            Đăng nhập ngay
          </Link>
        </p>
      )}

      <div className="mt-8">
        <Title level={4} className="mb-4">Đánh giá của khách hàng</Title>
        {reviews.length === 0 ? (
          <p className="text-gray-600">Chưa có đánh giá nào từ khách hàng.</p>
        ) : (
          <Space direction="vertical" size="middle" className="w-full">
            {reviews.map((review) => (
              <Card
                key={review.id}
                className="w-full shadow-sm border border-gray-200"
              >
                <div className="flex items-start mb-2">
                  {review.user && (
                    <div className="flex items-center mr-4">
                      <Avatar
                        size="small"
                        icon={<UserOutlined />}
                        className="bg-gray-300"
                      />
                      <Text strong className="ml-2">{review.user.name}</Text>
                    </div>
                  )}
                  <div>
                    <Rate
                      disabled
                      value={review.rating}
                      className="text-yellow-500 text-base"
                    />
                    <Text className="ml-2 text-sm text-gray-500 block sm:inline-block">
                      {new Date(review.createdAt).toLocaleDateString()}{' '}
                      {new Date(review.createdAt).toLocaleTimeString()}
                    </Text>
                  </div>
                </div>
                <Paragraph className="mb-0">{review.comment || 'Không có bình luận.'}</Paragraph>
              </Card>
            ))}
          </Space>
        )}
      </div>
    </div>
  );
}