// app/(auth)/reset-password/page.tsx
'use client'

import { Form, Input, Button, Card, message } from 'antd';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useResetPassword } from '@/hooks/auth/useResetPassword';
import { useEffect, useState } from 'react';

interface ResetPasswordFormValues {
  newPassword: string;
  confirmNewPassword: string;
}

export default function ResetPasswordPage() {
  const resetPasswordMutation = useResetPassword();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  const [form] = Form.useForm<ResetPasswordFormValues>();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      message.error('Liên kết đặt lại mật khẩu không hợp lệ hoặc bị thiếu.');
      router.push('/login');
    }
  }, [searchParams, router]);

  const onSubmit = (values: ResetPasswordFormValues) => {
    if (!token) {
      message.error('Không tìm thấy mã token đặt lại mật khẩu.');
      return;
    }

    resetPasswordMutation.mutate({ token, newPassword: values.newPassword }, {
      onSuccess: () => {
        message.success('Mật khẩu của bạn đã được đặt lại thành công!');
        router.push('/login');
      },
      onError: (error) => {
        message.error(error.message || 'Không thể đặt lại mật khẩu.');
      },
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <p className="text-lg text-red-500">Đang tải hoặc liên kết không hợp lệ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6"
      >
        <Card className="shadow-xl border rounded-2xl p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Đặt lại mật khẩu</h1>
            <p className="text-muted-foreground text-base mt-2">
              Vui lòng nhập mật khẩu mới của bạn
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            className="space-y-4"
          >
            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: 'Mật khẩu mới không được để trống' },
                { min: 6, message: 'Mật khẩu mới ít nhất 6 ký tự' },
              ]}
            >
              <Input.Password
                placeholder="••••••"
                className="rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="confirmNewPassword"
              label="Xác nhận mật khẩu mới"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Xác nhận mật khẩu mới không được để trống' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu mới và xác nhận mật khẩu không khớp'));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="••••••"
                className="rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetPasswordMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 rounded-md py-2 h-auto text-lg"
              >
                Đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>

          <div className="text-sm text-center text-muted-foreground mt-4">
            <Link href="/login" className="underline hover:text-blue-600 text-blue-500">
              ← Quay lại Đăng nhập
            </Link>
          </div>
        </Card>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-blue-500 underline hover:text-blue-600 transition-colors duration-150"
          >
            ← Quay về trang chủ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}