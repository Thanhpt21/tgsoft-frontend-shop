'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, Typography, Space, Input, Rate, Form, Avatar, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Rating } from '@/types/product.type';
import { useUpdateRating } from '@/hooks/rating/useUpdateRating';
import { useCreateRating } from '@/hooks/rating/useCreateRating';
import { useRatings } from '@/hooks/rating/useRatings';
import { useAuth } from '@/context/AuthContext';

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
    data: ratingsData,
    isLoading: isLoadingRatings,
    isError: isErrorRatings,
    error: ratingsError,
    refetch: refetchRatings
  } = useRatings({ productId, enabled: !!productId && !isLoadingAuth && currentUserId !== undefined });

  const {
    mutate: createRating,
    isPending: isCreatingRating,
    isSuccess: isCreateSuccess,
    error: createError
  } = useCreateRating();

  const {
    mutate: updateRating,
    isPending: isUpdatingRating,
    isSuccess: isUpdateSuccess,
    error: updateError
  } = useUpdateRating();

  const [userExistingRating, setUserExistingRating] = useState<Rating | null>(null);

  useEffect(() => {
    if (ratingsData?.data && currentUserId !== undefined) {
      const existingRating = ratingsData.data.find(
        (rating) => rating.postedBy?.id === currentUserId
      );
      setUserExistingRating(existingRating || null);

      if (existingRating) {
        form.setFieldsValue({
          rating: existingRating.star,
          comment: existingRating.comment,
        });
      } else {
        form.resetFields();
      }
    } else if (currentUserId === undefined && !isLoadingAuth) {
      form.resetFields();
      setUserExistingRating(null);
    }
  }, [ratingsData, productId, currentUserId, form, isLoadingAuth]);

  useEffect(() => {
    if ((isCreateSuccess || isUpdateSuccess) && !messageShownRef.current) {
      message.success('Đánh giá đã được gửi thành công!');
      refetchRatings();
      messageShownRef.current = true;
    }
    if (!isCreateSuccess && !isUpdateSuccess) {
      messageShownRef.current = false;
    }
  }, [isCreateSuccess, isUpdateSuccess, refetchRatings]);

  useEffect(() => {
    if (createError) {
      message.error(`Lỗi khi gửi đánh giá: ${createError.message}`);
    }
    if (updateError) {
      message.error(`Lỗi khi cập nhật đánh giá: ${updateError.message}`);
    }
  }, [createError, updateError]);

  const handleRatingSubmit = async (values: { rating: number; comment: string }) => {
    if (values.rating === 0) {
      message.error('Vui lòng chọn số sao đánh giá!');
      return;
    }

    if (!currentUserId) {
      message.error('Bạn phải đăng nhập để gửi đánh giá.');
      return;
    }

    messageShownRef.current = false;

    try {
      if (userExistingRating) {
        updateRating({
          id: userExistingRating.id,
          dto: {
            star: values.rating,
            comment: values.comment,
          },
        });
      } else {
        createRating({
          star: values.rating,
          comment: values.comment,
          productId,
        });
      }
    } catch (error) {
      // Error handled by useEffect
    }
  };

  if (isLoadingRatings || isLoadingAuth) {
    return <div className="text-center py-4 text-gray-600">Đang tải đánh giá...</div>;
  }

  if (isErrorRatings) {
    return (
      <div className="text-center py-4 text-red-500">
        Lỗi khi tải đánh giá: {ratingsError?.message}
      </div>
    );
  }

  const ratings = ratingsData?.data || [];

  const loginUrl = `/login?returnUrl=${encodeURIComponent(pathname)}`;

  return (
    <div className="py-4">
      <Title level={4} className="mb-4">Đánh giá của bạn</Title>
      {currentUserId ? (
        <Form form={form} layout="vertical" onFinish={handleRatingSubmit}>
          <Form.Item
            label="Xếp hạng của bạn"
            name="rating"
            rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá!' }]}
          >
            <Rate disabled={isCreatingRating || isUpdatingRating} />
          </Form.Item>
          <Form.Item label="Bình luận của bạn" name="comment">
            <TextArea
              rows={4}
              placeholder="Chia sẻ suy nghĩ của bạn về sản phẩm..."
              disabled={isCreatingRating || isUpdatingRating}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreatingRating || isUpdatingRating}
            >
              {userExistingRating ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <p className="text-gray-600">
          Đăng nhập để gửi đánh giá.{' '}
          <Link href={loginUrl} className="text-blue-500 underline hover:no-underline font-medium">
            Đăng nhập ngay
          </Link>
        </p>
      )}

      <div className="mt-8">
        <Title level={4} className="mb-4">Đánh giá của khách hàng</Title>
        {ratings.length === 0 ? (
          <p className="text-gray-600">Chưa có đánh giá nào từ khách hàng.</p>
        ) : (
          <Space direction="vertical" className="w-full">
            {ratings.map((rating) => (
              <Card key={rating.id} className="w-full shadow-sm border border-gray-200">
                <div className="flex items-start mb-2">
                  {rating.postedBy && (
                    <div className="flex items-center mr-4">
                      <Avatar
                        src={rating.postedBy.profilePicture || undefined}
                        icon={!rating.postedBy.profilePicture && <UserOutlined />}
                        size="large"
                      />
                      <Text strong>{rating.postedBy.name}</Text>
                    </div>
                  )}
                  <div>
                    <Rate disabled value={rating.star} className="text-yellow-500 text-base" />
                    <Text className="ml-2 text-sm text-gray-500 block sm:inline-block">
                      {new Date(rating.createdAt).toLocaleDateString()}{' '}
                      {new Date(rating.createdAt).toLocaleTimeString()}
                    </Text>
                  </div>
                </div>
                <Paragraph className="mb-0">{rating.comment}</Paragraph>
              </Card>
            ))}
          </Space>
        )}
      </div>
    </div>
  );
}